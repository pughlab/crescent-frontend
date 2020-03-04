const R = require('ramda')
const A = require('axios')
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
      return run
    },
  },
  Mutation: {
    createUnsubmittedRun: async (parent, {name, projectID, userID, datasetIDs}, {Runs, Minio}) => {
      const run = await Runs.create({name, projectID, createdBy: userID, datasetIDs})
      const {runID} = run
      await Minio.client.makeBucket(`run-${runID}`)
      return run
    },

    // Determine how many datasets this run uses and submit
    // appropriate CWL job to Express (should be replaced by WES)
    submitRun: async (parent, {runID, params}, {Runs}) => {
      try {
        const run = await Runs.findOne({runID})
        const {name, datasetIDs} = run
        console.log('Submitting run', runID, params, datasetIDs)
        const lengthIsOne = R.compose(R.equals(1), R.length)
        if (lengthIsOne(datasetIDs)) {
          await axios.post(
            `/express/runs/submit`,
            {},
            {params: {name, params, runID}}
          )
        } else {
          await axios.post(
            `/express/runs/submitMerged`,
            {},
            // DatasetIDs can be parsed from the params object quality control field
            {params: {name, params, runID}}
          )
        }
        run.params = params
        // run.status = 'submitted'
        await run.save()
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
    }
  }
}

module.exports = resolvers