const R = require('ramda')
const A = require('axios')
const axios = A.create({
  baseURL: 'http://server:4001',
  timeout: 10000,
});

const resolvers = {
  Query: {
    runs: async (parent, {projectID}, {Runs}) => {
      console.log('resolver', projectID)
      const runs = await Runs.find({})
      return runs
    },
    run: async (parent, {runID}, {Runs}) => {
      const run = await Runs.findOne({runID})
      return run
    },
  },
  Mutation: {
    createRun: async (parent, {name, params}, {Runs}) => {
      const run = await Runs.create({name, params})
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
  }
}

module.exports = resolvers