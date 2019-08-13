const R = require('ramda')

const resolvers = {
  Query: {
    project: async (parent, {projectID}, {Projects}) => {
      return await Projects.findOne({projectID})
    },
    projects: async (parent, variables, {Projects}) => {
      return await Projects.find({})
    }
  },
  Mutation: {
    createProject: async (parent, {userID}, {Project}) => {
      const project = await Projects.create({members: [userID]})
      return project
    }
  },
  // Subfield resolvers
  Project: {

  }
}

module.exports = resolvers