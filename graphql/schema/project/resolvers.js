const R = require('ramda')

const resolvers = {
  Query: {
    // Query a single project
    project: async (parent, {projectID}, {Projects}) => {
      return await Projects.findOne({projectID})
    },
    curatedProjects: async (parent, variables, {Projects}) => {
      return await Projects.find({
        kind: 'curated'
      })
    },
    projects: async (parent, {userID}, {Projects}) => {
      console.log(userID, 'projects')
      const projects = await Projects.find({
        $or: [
          // User is either the creator or project has been shared with them
          {createdBy: userID},
          {sharedWith: {$in: [userID]}},
        ],
        // Project must not be archived
        archived: {$eq: null}
      })
      return projects
    }
  },
  Mutation: {
    // Create a project given a userID
    // TODO: move userID into context
    createProject: async (
      parent,
      {
        userID,
        name,
        description,
        barcodesObjectName,
        genesObjectName,
        matrixObjectName,
      },
      {
        Projects
      }
    ) => {
      // console.log(barcodesObjectName, genesObjectName, matrixObjectName)
      const project = await Projects.create({name, description, createdBy: userID})
      return project
    },

    // Set the 'sharedWith' property  of a project to remove or add members
    shareProject: async (parent, {projectID, sharedWith}, {Projects}) => {
      const project = await Projects.findOne({projectID})
      project.sharedWith = R.uniq(sharedWith) //Just in case...
      await project.save()
      return project
    },

    archiveProject: async (parent, {projectID}, {Projects}) => {
      const project = await Projects.findOne({projectID})
      project.archived = new Date()
      await project.save()
      return project
    }
  },
  // Subfield resolvers
  Project: {
    // Query `User` types on a `Project` type in the `sharedWith` field
    sharedWith: async ({sharedWith}, variables, {Users}) => {
      return await Users.find({userID: {$in: sharedWith}})
    },
    createdBy: async ({createdBy}, variables, {Users}) => {
      return await Users.findOne({userID: createdBy})
    },
    runs: async ({projectID}, variables, {Runs}) => {
      console.log('find runs', projectID)
      return await Runs.find({projectID})
    }
  }
}

module.exports = resolvers