const R = require('ramda')

const {
  ApolloError
} = require('apollo-server')

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
      const projects = await Projects.find({
        kind: 'uploaded',
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
    createMergedProject: async (
      parent,
      {
        userID,
        name, description,
        projectIDs = [],
        datasetIDs = []
      },
      {
        Datasets,
        Projects,
        minioClient 
      }
    ) => {
      try {
        const project = await Projects.create({
          name, description,
          createdBy: userID,
          mergedProjectIDs: projectIDs,
          uploadedDatasetIDs: datasetIDs
        })
        return project
      } catch(error) {
        console.error(error)
      }
    },

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

    shareProjectByEmail: async (parent, {projectID, email}, {Projects, Users}) => {
      try {
        const project = await Projects.findOne({projectID})
        const {sharedWith} = project
        const user = await Users.findOne({email})
        if (R.isNil(user)) {
          return null
        } else {
          const {userID} = user
          project.sharedWith = R.append(userID, sharedWith)
          await project.save()
          return project
        }
      } catch(error) {
        console.error(error)
      }
    },
    unshareProjectByUserID: async (parent, {projectID, userID}, {Projects, Users}) => {
      try {
        const project = await Projects.findOne({projectID})
        const {sharedWith} = project
        // Use built in ObjectID equality method
        project.sharedWith = R.reject(memberObjectID => memberObjectID.equals(userID), sharedWith)
        await project.save()
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
    },

    addExternalUrl: async (parent, {projectID, label, link, type}, {Projects}) => {
      const project = await Projects.findOne({projectID})
      const existingUrls = project.externalUrls  
      project.externalUrls = R.append({label, link, type}, existingUrls)
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
      return await Runs.find({projectID})
    },

    datasetSize: async ({projectID}, variables, {Datasets, minioClient}) => {
      try {
        return await new Promise((resolve, reject) => {
          let size = 0
          const stream = minioClient.listObjects(`project-${projectID}`)
          stream.on('data', obj => {size = size + R.prop('size', obj)})
          stream.on('error', err => { reject(err) } )
          stream.on('end', () => {resolve(size)})
        })
      } catch(error) {
        // console.error(error)
      }

    },

    mergedProjects: async ({mergedProjectIDs}, variables, {Projects}) => {
      try {
        return await Promise.all(R.map(
          projectID => Projects.findOne({projectID}),
          mergedProjectIDs
        ))
      } catch(error) {
        console.error(error)
      }
    },

    uploadedDatasets: async ({uploadedDatasetIDs}, variables, {Datasets}) => {
      try {
        return await Datasets.find({
          datasetID: {$in: uploadedDatasetIDs}
        })
      } catch(error) {
        console.error(error)
      }
    }
  }
}

module.exports = resolvers