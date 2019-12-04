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
        Datasets,
        Projects,
        minioClient
      }
    ) => {
      try {
        const dataset = await Datasets.create({
          barcodesID: barcodesObjectName,
          featuresID: genesObjectName,
          matrixID: matrixObjectName
        })
        const {datasetID} = dataset
        const project = await Projects.create({name, description, createdBy: userID, datasetID})
        const {projectID} = project
        await minioClient.makeBucket(`project-${projectID}`)
        const copyObjectToProjectBucket = async (uploadID) => {
          // Get object from temporary bucket and put into project bucket
          const tempObjectStream = await minioClient.getObject('temporary', `${uploadID}`)
          await minioClient.putObject(`project-${projectID}`, `${uploadID}`, tempObjectStream)
          // Remove from temporary bucket
          await minioClient.removeObject('temporary', `${uploadID}`)

        }
        await copyObjectToProjectBucket(barcodesObjectName)
        await copyObjectToProjectBucket(genesObjectName)
        await copyObjectToProjectBucket(matrixObjectName)
        // Create directory of uploads for project so pipeline can read

        return project
      } catch(error) {
        console.error(error)
      }
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