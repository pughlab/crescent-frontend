const R = require('ramda')
const A = require('axios')
const fs = require('fs')
const axios = A.create({
  baseURL: `http://localhost:${process.env.EXPRESS_PORT}`,
  timeout: 10000,
});

const axiosWes = A.create({
  baseURL: `http://host.docker.internal:${process.env.WES_PORT}`,
  timeout: 10000,
});

const execSync = require('child_process').execSync

const resolvers = {
  Query: {
    allRuns: async (parent, variables, {Runs}) => {
      return await Runs.find({})
    },
    runs: async (parent, {projectID}, {Runs}) => {
      const runs = await Runs.find({projectID})
      return runs
    },
    run: async (parent, {runID}, {Runs}) => {
      const run = await Runs.findOne({runID})
      // console.log(run)
      return run
    },
  },
  Mutation: {
    createUnsubmittedRun: async (parent, {name, projectID, userID, datasetIDs}, {Runs, Minio, ToolSteps}) => {
      try {
        const run = await Runs.create({name, projectID, createdBy: userID, datasetIDs})
        const {runID} = run

        const isSingleDataset = R.compose(R.equals(1), R.length)(datasetIDs)

        // Add default parameters
        const defaultParameters = R.compose(
          R.evolve({
            // Copy default quality control parameters for each dataset
            quality: R.compose(
              R.zipObj(datasetIDs),
              R.repeat(R.__, R.length(datasetIDs))
            )
          }),
          R.map(
            R.compose(
              R.mergeAll,
              R.map(({parameter, input: {defaultValue}}) => ({[parameter]: defaultValue}))
            )
          ),
          R.groupBy(R.prop('step')),
          R.filter(R.prop(isSingleDataset ? 'singleDataset' : 'multiDataset'))
        )(await ToolSteps.find({}))

        console.log(defaultParameters)
        run.parameters = defaultParameters
        await run.save()
        // Make bucket for run
        await Minio.client.makeBucket(`run-${runID}`)
        return run
      } catch (err) {
        console.log(err)
      }
    },

    updateRunParameterValue: async (
      parent,
      {runID, step, parameter, value},
      {Runs}
    ) => {
      try {
        const run = await Runs.findOne({runID})
        // For non-QC parameters
        const {parameters} = run
        let newParameters
        if (R.equals(step, 'quality')) {
          const {value: newValue, datasetID} = value
          newParameters = R.assocPath([step, datasetID, parameter], newValue, parameters)
        } else {
          newParameters = R.assocPath([step, parameter], value, parameters)
        }
        // console.log(newParameters)
        run.parameters = newParameters
        await run.save()
        // console.log(run.runID, run.name, run.parameters)
        return run
      } catch (err) {
        console.log(err)
      }
    },

    bulkUpdateRunParameterValues: async (
      parent,
      {runID, parameters},
      {Runs}
    ) => {
      try {
        const run = await Runs.findOne({runID})
        run.parameters = parameters
        await run.save()
        return run
      } catch (err) {
        console.log('bulkUpdateRunQCParameterValues', err)
      }
    },

    // Determine how many datasets this run uses and submit
    // appropriate CWL job to Express (should be replaced by WES)
    submitRun: async (parent, {runID}, {Runs}) => {
      try {
        const run = await Runs.findOne({runID})
        const {name, datasetIDs} = run
        // console.log('Submitting run', runID, datasetIDs)
        // run.params = params
        run.status = 'submitted'
        await run.save()
        const lengthIsOne = R.compose(R.equals(1), R.length)
        if (lengthIsOne(datasetIDs)) {
          await axios.post(
            `/express/runs/submit`,
            {},
            // axios params 
            {params: {name, runID}}
          )
        } else {
          await axios.post(
            `/express/runs/submitMerged`,
            {},
            // DatasetIDs can be parsed from the params object quality control field
            {params: {name, runID}}
          )
        }
        return run
      } catch(error) {
        console.log(error)
      }
    },

    deleteRun: async(parent, {runID}, {Runs}) => {
      try {
        const run = await Runs.findOne({runID})
        await Runs.deleteOne({runID})
        return run
      } catch(error) {
        console.error(error)
      }
    },
  },
  Run: {
    createdBy: async({createdBy}, variables, {Users}) => {
      const user = await Users.findOne({userID: createdBy})
      return user
    },
    // Subfield resolvers
    project: async ({projectID}, variables, {Projects}) => {
      // Find project that run belongs to
      const project = await Projects.findOne({projectID})
      return project
    },

    datasets: async({datasetIDs}, variables, {Datasets}) => {
      return await Datasets.find({
        datasetID: {
          $in: datasetIDs
        }
      })
    },
    status: async({wesID, status, runID}, variables, {Runs,  Minio}) => {
      // If it has not been submitted yet
      if (wesID == null)
        return status;
      
      // Make request to wes and figure out status
      var ret = status;
      // Assuming run status can never change from completed, we don't need to ask wes
      if (status != 'completed') {
        await axiosWes.get(
          `/ga4gh/wes/v1/runs/${wesID}/status`,
        ).then((response) => {
          // Translate WES status to Run status
          if (response.data.state == "COMPLETE")
            ret = "completed";
          else if (response.data.state == "EXECUTOR_ERROR")
            ret = "failed";
          else if (response.data.state == "RUNNING")
            ret = "submitted";
        }, (error) => {
          console.log(error);
        })
        // Update status in mongo to conform with status from wes, unless the run is already completed
        Runs.updateOne({"wesID": wesID}, {$set: {"status": ret}}, function(err, res) {
          if (err)
            console.log(err);
        });
      }

      return ret;
    },
    completedOn: async({wesID, status, runID, completedOn, submittedOn}, variables, {Runs, Minio}) => {
      // I am assuming/hoping this runs after the status resolver, because the status field in mongo needs
      // to be up to date, so far it seems that this is true

      // If we have already found completedOn, we don't want to recalculate it
      if (completedOn != null){
        return completedOn;
      }
      // Otherwise we now find completedOn and upload log file:

      // Default value for completedOn, if you see a running time that is increasing on frontend, it is because something below broke
      var completionDate = Date.now();
      // Adding logfile to minio if it's not there
      // Check if run failed or succeded, in which case there should be a log
      if (status == 'failed'){
        // Put log file in minio
        await axiosWes.get(
          `/ga4gh/wes/v1/runs/${wesID}`,
        ).then((response) => {
          // Send response.data.run_log.stderr to minio via buffer
          console.log("Sending runLog for " + runID + " to minio");
          Minio.client.putObject("run-" + runID, 'runLog.txt', response.data.run_log.stderr);
        }, (error) => {
          console.log(error);
        })
        // Need to somehow get and update completedOn??
      }
      else if (status == "completed"){
        
        // Put log file in minio and update completedOn
        await axiosWes.get(
          `/ga4gh/wes/v1/runs/${wesID}`,
        ).then((response) => {
          // Find log file and send it to minio
          // Parse response to find name of log file in wes/logs
          var logFilePrefix = "file:---" + response.data.request.workflow_attachment.substring(8).split('/').join('-');
          var logFile = "wes/logs/" + fs.readdirSync('wes/logs').filter(fn => fn.startsWith(logFilePrefix)).filter(fn => fn.toLowerCase().includes('seurat'))[0];
          console.log("Sending runLog for run " + runID + " to minio");
          // Send to minio
          Minio.client.fPutObject("run-" + runID, 'runLog.txt', logFile);
          // If logfile space is an issue, the log file can be deleted at the end of this else if

          // Sum running times of each job and add to submittedOn
          var files = fs.readdirSync('wes/logs').filter(fn => fn.startsWith(logFilePrefix));
          var totalSeconds = parseFloat('0');
          files.forEach(element => {
            // Sum the timing information from these files by spawning processes that tail the last line
            // Processes are expensive, but so are js alternatives I have looked into
            // I spent like 3 hours trying to find a js way to only read last line of a file, to no avail
            
            var line = execSync('tail -1 wes/logs/' + element, {encoding: 'utf-8'});
            line = line.toString().split(' ');
            totalSeconds += parseFloat(line[line.length - 2]);
            
          });
          // Now do date math with submittedOn
          completionDate = new Date(submittedOn.getTime() + totalSeconds*1000);
        }, (error) => {
          console.log(error);
        })
      }
      else {
        // If status is not completed or failed, there is no need for a completedOn date
        return null;
      }
      
      // Finally upload date to mongo and return it
      Runs.updateOne({"wesID": wesID}, {$set: {"completedOn": completionDate}}, function(err, res) {
        if (err)
          console.log(err);
      });
      console.log("Setting completedOn for " + runID + " to " + completionDate);
      return completionDate;
    }
  }
}

module.exports = resolvers