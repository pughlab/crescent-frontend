const R = require('ramda')

const resolvers = {
  Query: {
    // Query a single project
    project: async (parent, {projectID}, {Projects}) => {
      return await Projects.findOne({projectID})
    },
    // Query multiple projects
    projects: async (parent, {userID}, {Projects}) => {
      return await Projects.find({
        $or: [{createdBy: userID}, {members: {$elemMatch: {$eq: userID}}}]
      })
    }
  },
  Mutation: {
    // Create a project given a userID
    // TODO: move userID into context
    createProject: async (parent, {userID, name, description}, {Projects}) => {
      const project = await Projects.create({name, description, createdBy: userID})
      return project
    },
    // Add a user to be a member of a project
    addUserToProject: async (parent, {userID, projectID}, {Projects, Users}) => {
      const project = await Projects.findOne({projectID})
      // Append user to add and make sure only one copy exists
      project.members = R.compose(
        R.uniq,
        R.append(userID),
        R.prop('members')
      )(project)
      await project.save()
      return project
    }
  },
  // Subfield resolvers
  Project: {
    // Query `User` types on a `Project` type in the `members` field
    members: async ({members}, variables, {Users}) => {
      const userMembers = await Users.find({userID: {$in: members}})
      return userMembers
    },
    createdBy: async ({createdBy}, variables, {Users}) => {
      return Users.findOne({userID: createdBy})
    }
  }
}

module.exports = resolvers