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
      console.log('resolver', projectID)
      const runs = await Runs.find({projectID})
      return runs
    },
    run: async (parent, {runID}, {Runs}) => {
      const run = await Runs.findOne({runID})
      return run
    },
  },
  Mutation: {
    createUnsubmittedRun: async (parent, {name, projectID, userID}, {Runs}) => {
      const run = await Runs.create({name, projectID, createdBy: userID})
      return run
    },

    submitRun: async (parent, {runID, params}, {Runs}) => {
      const run = await Runs.findOne({runID})
      const {name} = run
      console.log('Submitting run', runID, params)
      const submit = await axios.post(
        `/runs/submit`,
        {},
        {params: {name, params, runID}}
      )
      run.params = params
      run.status = 'submitted'
      await run.save()
      return run
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
    }
  }
}

module.exports = resolvers