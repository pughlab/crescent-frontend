const R = require('ramda')

const resolvers = {
  Query: {
    project: async (parent, {projectID}, {Projects}) => {
      return null
    },
    projects: async (parent, variables, {Projects}) => {
      return await Projects.find({})
    }
  },
  Mutation: {
    createProject: async (parent, {userID}, {Project}) => {
      return null
    }
  },
  // Subfield resolvers
  Project: {

  }
}

module.exports = resolvers