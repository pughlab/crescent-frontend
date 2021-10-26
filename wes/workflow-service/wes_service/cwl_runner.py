from __future__ import print_function
from datetime import datetime
import docker
import json
from minio import Minio
import os
import shutil
import subprocess
import uuid

from wes_service.util import WESBackend

docker_client = docker.DockerClient(base_url='unix://var/run/docker.sock')
minio_client = Minio(
    'crescent-dev.ccm.sickkids.ca:' + os.getenv('MINIO_HOST_PORT'),
    access_key=os.getenv('MINIO_ACCESS_KEY'),
    secret_key=os.getenv('MINIO_SECRET_KEY'),
    secure=True
)

class Workflow(object):
    def __init__(self, run_id):
        super(Workflow, self).__init__()
        self.run_id = run_id
        self.workdir = os.path.join(os.getcwd(), "workflows", self.run_id)
        self.outdir = os.path.join(self.workdir, 'outdir')
        if not os.path.exists(self.outdir):
            os.makedirs(self.outdir)

    def run(self, request, tempdir, opts):
        """
        Constructs a command to run a cwl/json from requests and opts,
        runs it, and deposits the outputs in outdir.

        Runner:
        opts.getopt("runner", default="cwl-runner")

        CWL (url):
        request["workflow_url"] == a url to a cwl file
        or
        request["workflow_attachment"] == input cwl text (written to a file and a url constructed for that file)

        JSON File:
        request["workflow_params"] == input json text (to be written to a file)

        :param dict request: A dictionary containing the cwl/json information.
        :param wes_service.util.WESBackend opts: contains the user's arguments;
                                                 specifically the runner and runner options
        :return: {"run_id": self.run_id, "state": state}
        """
        with open(os.path.join(self.workdir, "request.json"), "w") as f:
            json.dump(request, f)

        with open(os.path.join(self.workdir, "cwl.input.json"), "w") as inputtemp:
            json.dump(request["workflow_params"], inputtemp)

        workflow_url = request.get("workflow_url")  # Will always be local path to descriptor cwl, or url.

        output = open(os.path.join(self.workdir, "cwl.output.json"), "w")
        stderr = open(os.path.join(self.workdir, "stderr"), "w")

        runner = opts.getopt("runner", default="cwl-runner")
        extra = opts.getoptlist("extra")

        # replace any locally specified outdir with the default
        for e in extra:
            if e.startswith('--outdir='):
                extra.remove(e)
        extra.append('--outdir=' + self.outdir)

        # link the cwl and json into the tempdir/cwd
        if workflow_url.startswith('file://'):
            os.symlink(workflow_url[7:], os.path.join(tempdir, "wes_workflow.cwl"))
            workflow_url = os.path.join(tempdir, "wes_workflow.cwl")
        os.symlink(inputtemp.name, os.path.join(tempdir, "cwl.input.json"))
        jsonpath = os.path.join(tempdir, "cwl.input.json")

        # build args and run
        command_args = [runner] + extra + [workflow_url, jsonpath]
        proc = subprocess.Popen(command_args,
                                stdout=output,
                                stderr=stderr,
                                close_fds=True,
                                cwd=tempdir)
        output.close()
        stderr.close()
        with open(os.path.join(self.workdir, "pid"), "w") as pid:
            pid.write(str(proc.pid))

        return self.getstatus()

    def getstate(self):
        """
        Returns RUNNING, -1
                COMPLETE, 0
                or
                EXECUTOR_ERROR, 255
        """
        state = "RUNNING"
        exit_code = -1

        exitcode_file = os.path.join(self.workdir, "exit_code")
        pid_file = os.path.join(self.workdir, "pid")

        if os.path.exists(exitcode_file):
            with open(exitcode_file) as f:
                exit_code = int(f.read())
        elif os.path.exists(pid_file):
            with open(pid_file, "r") as pid:
                pid = int(pid.read())
            try:
                (_pid, exit_status) = os.waitpid(pid, os.WNOHANG)
                if _pid != 0:
                    exit_code = exit_status >> 8
                    with open(exitcode_file, "w") as f:
                        f.write(str(exit_code))
                    os.unlink(pid_file)
            except OSError:
                os.unlink(pid_file)
                exit_code = 255

        if exit_code == 0:
            state = "COMPLETE"
        elif exit_code != -1:
            state = "EXECUTOR_ERROR"

        return state, exit_code

    def getstatus(self):
        state, exit_code = self.getstate()

        return {
            "run_id": self.run_id,
            "state": state
        }

    def getlog(self):
        state, exit_code = self.getstate()

        with open(os.path.join(self.workdir, "request.json"), "r") as f:
            request = json.load(f)

        with open(os.path.join(self.workdir, "stderr"), "r") as f:
            stderr = f.read()

        outputobj = {}
        if state == "COMPLETE":
            output_path = os.path.join(self.workdir, "cwl.output.json")
            with open(output_path, "r") as outputtemp:
                outputobj = json.load(outputtemp)
        
        return {
            "run_id": self.run_id,
            "request": request,
            "state": state,
            "run_log": {
                "cmd": [""],
                "start_time": "",
                "end_time": "",
                "stdout": "",
                "stderr": stderr,
                "exit_code": exit_code
            },
            "task_logs": [],
            "outputs": outputobj
        }


# CReSCENT-specific
class WorkflowCrescent(object):
    def __init__(self, is_secondary_run=False, run_id=None, state=None, submitted_on_time=None, wes_id=None):
        if wes_id is not None:
            self.response = Workflow(wes_id).getlog() # The response object for the run
            self.log_file_prefix = "{}:---{}".format(
                "failed_file" if state == "EXECUTOR_ERROR" else "file",
                self.response['request']['workflow_attachment'][8:].replace('/', '-')
            ) # The log file prefix for this run's log files
        
        self.is_secondary_run = is_secondary_run # Whether or not the run is a secondary run
        self.run_id = run_id # CReSCENT's runID
        self.state = state # State of the run
        self.submitted_on_time = submitted_on_time # The submited on time for the run
        self.wes_id = wes_id # WES' runID

    # Helper methods
    def getcontainerid(self):
        # Helper function for determining if any of the container's mounts' destination contain the relevant runID
        def mountDestinationIncludesRunID(container):
            return any([mount for mount in docker_client.api.inspect_container(container.id)['Mounts'] if self.run_id in mount['Destination']])

        # Returns the containerID of the container who has a mount with a destination value that contains the relevant runID
        # Otherwise, returns None if no container was found
        return next((container.id for container in docker_client.containers.list() if mountDestinationIncludesRunID(container)), None)
    
    def getcontainerbyid(self, container_id):
        return docker_client.containers.get(container_id)

    def getfilesfromprefix(self):
        try:
            # The directory where the WES logs are located
            wes_logs_dir = "/root/logs"
            # Filter out the files, leaving only the ones that begin with the relevant file prefix
            log_file_paths = [os.path.join(wes_logs_dir, file) for file in os.listdir(wes_logs_dir) if os.path.join(wes_logs_dir, file)[11:].startswith(self.log_file_prefix)]
            return log_file_paths
        except:
            return []

    # Clean-up method
    def clean_temp_dir(self):
        try:
            std_err = self.response['run_log']['stderr']
            mount = "/var/lib/toil"
            start = std_err.index(mount) + len(mount) + 1
            end = std_err.index("/", start)
            dir = std_err[start:end]
            
            # os.rmtree() doesn't allow for the deletion of non-empty directories
            # So, we will have to use shutil.rmtree() here instead
            shutil.rmtree(os.path.join(mount, dir))
        except:
            pass

    # Main methods
    def cancel(self):
        try:
            # Find the containerID of the Docker container responsible for this run's workflow
            container_id = self.getcontainerid()
            # Get the Docker container by its containerID
            container = self.getcontainerbyid(container_id)
            # Kill the Docker container
            container.kill()

            return {
                "run_id": self.run_id
            }
        except docker.errors.APIError as e:
            return {
                "msg": e,
                "status_code": 500
            }

    def getdockerlogs(self):
        try:
            # Find the containerID of the Docker container responsible for this run's workflow
            container_id = self.getcontainerid()
            # Get the Docker container by its containerID
            container = self.getcontainerbyid(container_id)
            # Get the logs from the Docker container
            docker_logs = container.logs(stderr=False).decode("utf-8")
        except:
            docker_logs = None

        return {
            "docker_logs": docker_logs
        }

    def getcompletedon_executor_error(self, log_file_paths):
        try:
            # Get the file modification time (mtime) for each of the log files
            log_files_mtime = [os.path.getmtime(log_file_path) for log_file_path in log_file_paths]
            # Sort the mtimes in descending order
            log_files_mtime.sort(reverse=True)
            # Get the latest file modification time (mtime) which should now now be the first item in the list if log files exist
            [latest_mtime] = log_files_mtime
        except:
            # Set latest_mtime to None if no log files exist
            latest_mtime = None
        
        return datetime.fromtimestamp(latest_mtime)
    
    def getcompletedon_complete(self, log_file_paths):
        # Filter out the paths of log files that shouldn't be uploaded to Minio (those that contain any of the substrings below)
        filtered_strings = ["clean", "extract", "upload"]
        minio_log_file_paths = [log_file_path for log_file_path in log_file_paths if not(any(filtered_string in log_file_path for filtered_string in filtered_strings))]

        # Upload the relevant log files to Minio
        for minio_log_file_path in minio_log_file_paths:
            minio_log_filename = minio_log_file_path[11:] # The file path without "/root/logs/" prefixing it
            removed_prefix = minio_log_filename.replace(self.log_file_prefix, '') # The filename without the log file prefix
            name = removed_prefix[:removed_prefix.index('.')] # The filename without the file extension

            # For runs: "annotationRunLog-" + name + "-" + self.wesID + ".txt"
            # For secondary runs: "runLog-" + name + "-" + self.runID + ".txt"
            minio_client.fput_object(
                "run-%s" % self.run_id,
                "{}-{}-{}.txt".format(
                    "annotationRunLog" if self.is_secondary_run else "runLog",
                    name,
                    self.wes_id if self.is_secondary_run else self.run_id
                ),
                minio_log_file_path
            )

        total_seconds = float(0)

        # Sum up the total time (in seconds) based on the line "... we ran for a total of ____ seconds" from the log files
        for log_file_path in log_file_paths:
            line = subprocess.check_output(
                "tail -1 %s" % log_file_path,
                shell=True
            ).decode('utf-8').split(' ')
            elapsed_time = line[len(line) - 2]
            total_seconds += float(elapsed_time)

        # submitted_on_time comes from Date.prototype.getTime() which returns the time in milliseconds
        # We are working with seconds here, so we need to convert from milliseconds to seconds
        return datetime.fromtimestamp((float(self.submitted_on_time) / 1000)  + total_seconds)

    def getcompletedon(self):
        # Get the relevant log files based on the determined log file prefix
        log_file_paths = self.getfilesfromprefix()

        # The completedOn date is calculated differently depending on the state (EXECUTOR_ERROR vs COMPLETE)
        if self.state == "EXECUTOR_ERROR":
            completed_on = self.getcompletedon_executor_error(log_file_paths)
        elif self.state == "COMPLETE":
            completed_on = self.getcompletedon_complete(log_file_paths)
        else:
            completed_on = None

        # Call the clean-up helper method
        self.clean_temp_dir()
        
        return {
            "completed_on": completed_on
        }


class CWLRunnerBackend(WESBackend):
    def GetServiceInfo(self):
        runner = self.getopt("runner", default="cwl-runner")
        stdout, stderr = subprocess.Popen([runner, "--version"], stderr=subprocess.PIPE).communicate()
        r = {
            "workflow_type_versions": {
                "CWL": {"workflow_type_version": ["v1.0"]}
            },
            "supported_wes_versions": ["0.3.0", "1.0.0"],
            "supported_filesystem_protocols": ["file", "http", "https"],
            "workflow_engine_versions": {
                "cwl-runner": str(stderr)
            },
            "system_state_counts": {},
            "tags": {}
        }
        return r

    def ListRuns(self, page_size=None, page_token=None, state_search=None):
        # FIXME #15 results don't page
        if not os.path.exists(os.path.join(os.getcwd(), "workflows")):
            return {"workflows": [], "next_page_token": ""}
        wf = []
        for l in os.listdir(os.path.join(os.getcwd(), "workflows")):
            if os.path.isdir(os.path.join(os.getcwd(), "workflows", l)):
                wf.append(Workflow(l))

        workflows = [{"run_id": w.run_id, "state": w.getstate()[0]} for w in wf]  # NOQA
        return {
            "workflows": workflows,
            "next_page_token": ""
        }

    def RunWorkflow(self, **args):
        tempdir, body = self.collect_attachments()

        run_id = uuid.uuid4().hex
        job = Workflow(run_id)

        job.run(body, tempdir, self)
        return {"run_id": run_id}

    def GetRunLog(self, run_id):
        job = Workflow(run_id)
        return job.getlog()

    def GetRunStatus(self, run_id):
        job = Workflow(run_id)
        return job.getstatus()

    # CReSCENT-specific
    def CancelRun(self, run_id):
        job = WorkflowCrescent(run_id=run_id)
        return job.cancel()

    def GetDockerLogs(self, run_id):
        job = WorkflowCrescent(run_id=run_id)
        return job.getdockerlogs()

    def GetCompletedOn(self, is_secondary_run=False, run_id=None, state=None, submitted_on_time=None, wes_id=None):
        job = WorkflowCrescent(
            is_secondary_run,
            run_id=run_id,
            state=state,
            submitted_on_time=submitted_on_time,
            wes_id=wes_id
        )
        return job.getcompletedon()


def create_backend(app, opts):
    return CWLRunnerBackend(opts)
