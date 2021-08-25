const R = require('ramda')
const RA = require('ramda-adjunct')
const A = require('axios')
var rimraf = require("rimraf");
const axios = A.create({
  baseURL: `http://localhost:${process.env.EXPRESS_PORT}`,
  timeout: 10000,
});

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
    createUnsubmittedRun: async (parent, {name, description, projectID, userID, datasetIDs}, {Runs, Minio, ToolSteps}) => {
      try {
        const isSingleDataset = R.compose(R.equals(1), R.length)(datasetIDs)

        const defaultReferenceDatasetIDs = isSingleDataset ? {referenceDatasetIDs: datasetIDs} : {} //if single dataset run then default to that one dataset
        const run = await Runs.create({name, description, projectID, createdBy: userID, datasetIDs, ... defaultReferenceDatasetIDs})
        const {runID} = run

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
    cancelRun: async(parent, {runID}, {Runs, dataSources}) => {
      try {
        const {status_code} = await dataSources.wesAPI.cancelRun(runID)

        if (RA.isUndefined(status_code)) {
          await Runs.updateOne({runID}, {$set: {"status": 'failed'}})
          return "failed";
        }
      } catch (error) {
        console.log(error);
      }
    },
    uploadRunMetadata: async (parent, {runID, metadata}, {Runs, Minio}) => {
      try {
        const run = await Runs.findOne({runID})
        if (RA.isNotNil(run)) {
          const bucketName = `run-${runID}`
          await Minio.putUploadIntoBucket(bucketName, metadata, 'SEURAT/CRESCENT_CLOUD/frontend_metadata/metadata.tsv')  
        
          const m = await metadata
          run.uploadNames.metadata = m.filename
          await run.save()        

          return run
        }
      } catch(error) {
        console.log(error)
      }
    },

    uploadRunGeneset: async (parent, {runID, geneset}, {Runs, Minio}) => {
      try {
        const run = await Runs.findOne({runID})
        if (RA.isNotNil(run)) {
          const bucketName = `run-${runID}`
          await Minio.putUploadIntoBucket(bucketName, geneset, 'GSVA/GSVA_INPUTS/geneset.gmt')      

          // const g = await geneset
          // run.uploadNames.gsva = g.filename
          // await run.save()

          return run
        }
      } catch(error) {
        console.log(error)
      }
    },

    updateRunReferenceDatasets: async (parent, {runID, datasetIDs}, {Runs}) => {
      try {
        const run = await Runs.findOne({runID})
        run.referenceDatasetIDs = datasetIDs
        await run.save()
        return run
      } catch(error) {
        console.log(error)
      }
    },

    // edit run description
    updateRunDescription: async (parent, {runID, newDescription}, {Runs}) => {
      const run = await Runs.findOne({runID})
      run.description = newDescription
      await run.save()
      return run
    },

    // edit run name
    updateRunName: async (parent, {runID, newName}, {Runs}) => {
      const run = await Runs.findOne({runID})
      run.name = newName
      await run.save()
      return run
    }
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
      try {
        return await Datasets.find({datasetID: {$in: datasetIDs}})
      } catch(error) {
        console.log(error)
      }
    },
    referenceDatasets: async ({referenceDatasetIDs}, variables, {Datasets}) => {
      try {
        return await Datasets.find({datasetID: {$in: referenceDatasetIDs}})
      } catch(error) {
        console.log(error)
      }
    },

    logs: async({runID}, variables, {dataSources}) => {
      try {
        const {docker_logs} = await dataSources.wesAPI.getLogs(runID);
        return docker_logs
      } catch (error) {
        console.log(error)
      }
    },

    hasResults: async ({runID}, variables, {Minio}) => {
      try {
        const runBucketObjects = await Minio.bucketObjectsList(`run-${runID}`)
        const hasResultsDir = R.any(R.propEq('prefix', 'SEURAT/'))
        return hasResultsDir(runBucketObjects)
      } catch (error) {
        console.log(error)
      }
    },

    status: async({wesID, status}, variables, {Runs, dataSources, Docker}) => {
      
      
      // If it has not been submitted yet
      if (wesID == null)
        return status;
      
      // Make request to wes and figure out status
      let ret = status;
      // Assuming run status can never change from completed or failed, we don't need to ask wes
      if (status != 'completed' && status != 'failed') {
        try {
          response = await dataSources.wesAPI.getStatus(wesID);
        }
        catch (error){
          console.log("Error geting status of " + wesID + " from wes");
          return ret;
        }
        // Translate WES status to Run status
        if (response.state == "COMPLETE") {
          ret = "completed";
        } else if (response.state == "EXECUTOR_ERROR") {
          ret = "failed";
        } else if (response.state == "RUNNING") {
          ret = "submitted";
        }
        // Update status in mongo to conform with status from wes, unless the run is already completed
        await Runs.updateOne({"wesID": wesID}, {$set: {"status": ret}}, function(err, res) {
          if (err)
            console.log(err);
        });
      }

      return ret;
    },
    completedOn: async({wesID, runID, completedOn, submittedOn}, variables, {Runs, Minio, dataSources}) => {
      // Don't recalculate completedOn if it's already been calculated
      // Don't calculate completedOn if the run hasn't been submitted yet
      if (completedOn != null || wesID == null) return completedOn;

      // Make a request to WES API to get the run data for this run
      try {
        response = await dataSources.wesAPI.getRunData(wesID);
      } catch {
        console.log("Error getting run data from WES")
        return completedOn;
      }

      // If the running time is increasing in the frontend, it is means that the value of completionDate was never changed from its default value (null)
      let completionDate = null;

      // If the run failed (EXECUTOR_ERORR) or succeeded (COMPLETE), there should be (a) log file(s) for it
      if (response.state == 'EXECUTOR_ERROR') {
        // Upload the run log to Minio
        console.log(`Uploading run log for ${runID} to MinIO`);
        Minio.client.putObject(`run-${runID}`, `failedRunLog-${runID}.txt`, response.run_log.stderr);
        
        // Make a request to WES API to get the completed on time
        try {
          const {completed_on} = await dataSources.wesAPI.getCompletedOn({
            state: 'EXECUTOR_ERROR',
            wesID
          });

          // If completed_on is null, then no log files were found, so we set the completionDate to be the current time
          completionDate = completed_on || Date.now();
        } catch (error) {
          console.log("Error getting completed on time from WES");
        }
      } else if (response.state == "COMPLETE") {
        try {
          const {completed_on} = await dataSources.wesAPI.getCompletedOn({
            runID,
            state: 'COMPLETE',
            submittedOnTime: submittedOn.getTime(),
            wesID
          });

          completionDate = completed_on;
        } catch (error) {
          console.log("Error getting completed on time from WES");
        }
      } else {
        // If run's status isn't completed (COMPLETE) or failed (FAILED), then there's no need to calculate the completed on time or upload any log files
        return null;
      }

      // Lastly, update Mongo with the new completion date for this run
      Runs.updateOne({"wesID": wesID}, {$set: {"completedOn": completionDate}}, function(err, res) {
        if (err)
          console.log(err);
      });
      
      return completionDate;
    },
  },
  SecondaryRun: {
    status: async ({wesID, status}, variables, {Runs, dataSources}) => {
      try {
        // If it has not been submitted yet
        if (wesID == null)
          return status;
        
        // Make request to wes and figure out status
        let ret = status;
        // Assuming run status can never change from completed or failed, we don't need to ask wes
        // if (status != 'completed' && status != 'failed') {
          try {
            response = await dataSources.wesAPI.getStatus(wesID);
          }
          catch (error){
            console.log("Error geting status of " + wesID + " from wes");
            return ret;
          }
          // Translate WES status to Run status
          if (response.state == "COMPLETE") {
            ret = "completed";
          } else if (response.state == "EXECUTOR_ERROR") {
            ret = "failed";
          } else if (response.state == "RUNNING") {
            ret = "submitted";
          }
          // Update status in mongo to conform with status from wes, unless the run is already completed
          
          // fix 
          await Runs.updateOne({"secondaryRuns.wesID": wesID}, {$set: {"secondaryRuns.$.status": ret}}, function(err, res) {
          // await Runs.updateOne({"wesID": wesID}, {$set: {"status": ret}}, function(err, res) {
            if (err)
              console.log(err);
          });
        // }
        return ret;
      } catch (error) {
        console.log(error)
      }
    },
    logs: async({runID}, variables, {dataSources}) => {
      try {
        const {docker_logs} = await dataSources.wesAPI.getLogs(runID);
        return docker_logs
      } catch (error) {
        console.log(error)
      }
    },
    completedOn: async({wesID, completedOn, submittedOn}, variables, {Runs, Minio, dataSources}) => {
      // Don't recalculate completedOn if it's already been calculated
      // Don't calculate completedOn if the run hasn't been submitted yet
      if (completedOn != null || wesID == null) return completedOn;

      // Find the runID given the secondary run's wesID
      const {runID} = await Runs.findOne({"secondaryRuns.wesID": wesID});

      // Make a request to WES API to get the run data for this secondary run
      try {
        response = await dataSources.wesAPI.getRunData(wesID);
      } catch (error) {
        console.log("Error getting run data from WES")
        return completedOn;
      }

      // If the running time is increasing in the frontend, it is means that the value of completionDate was never changed from its default value (null)
      let completionDate = null;

      // If the run failed (EXECUTOR_ERORR) or succeeded (COMPLETE), there should be (a) log file(s) for it
      if (response.state == 'EXECUTOR_ERROR') {
        // Upload the run log to Minio
        console.log(`Uploading run log for ${wesID} to MinIO`);
        Minio.client.putObject(`run-${runID}`, `failedAnnotationRunLog-${wesID}.txt`, response.run_log.stderr);
        
        // Make a request to WES API to get the completed on time
        try {
          const {completed_on} = await dataSources.wesAPI.getCompletedOn({
            state: 'EXECUTOR_ERROR',
            wesID
          });

          // If completed_on is null, then no log files were found, so we set the completionDate to be the current time
          completionDate = completed_on || Date.now();
        } catch (error) {
          console.log("Error getting completed on time from WES");
        }
      } else if (response.state == "COMPLETE") {
        // Make a request to the WES API endpoint to get the completed on date
        try {
          const {completed_on} = await dataSources.wesAPI.getCompletedOn({
            isSecondaryRun: true, // Flag to indicate that we are getting the completed on time for a secondary run
            runID,
            state: 'COMPLETE',
            submittedOnTime: submittedOn.getTime(),
            wesID
          });

          completionDate = completed_on;
        } catch (error) {
          console.log("Error getting completed on time from WES");
        }
      } else {
        // If run's status isn't completed (COMPLETE) or failed (FAILED), then there's no need to calculate the completed on time or upload any log files
        return null;
      }

      // Lastly, update Mongo with the new completion date for this secondary run
      Runs.updateOne({"secondaryRuns.wesID": wesID}, {$set: {"secondaryRuns.$.completedOn": completionDate}}, function(err, res) {
        if (err) console.log(err);
      });
      
      return completionDate;
    },
  }
}

module.exports = resolvers