const R = require('ramda')
const A = require('axios')
const axios = A.create({
  baseURL: 'http://server:4001',
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

    createRun: async (parent, {name, params, projectID}, {Runs}) => {
      const run = await Runs.create({name, params, projectID})
      const {runID} = run
      // Note: 'params' word is abused here
      const submit = await axios.post(
        `/runs/submit/${runID}`,
        {},
        // This is 'query' in Express
        {params: {name, params}}
      )
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
    }
  }
}

module.exports = resolvers