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
    createProject: async (parent, {userID}, {Projects}) => {
      console.log(userID)
      const project = await Projects.create({name: 'test project'})
      return project
    }
  },
  // Subfield resolvers
  Project: {

  }
}

module.exports = resolvers