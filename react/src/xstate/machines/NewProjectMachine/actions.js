import { actions, assign, send, spawn } from 'xstate'
import { InputUploadMachine } from '../'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const { pure } = actions

// Add the dataset's ID if the dataset was successfully uploaded by its actor
const addUploadedDatasetID = pure(
  (_, event) => 'state' in event ? assign({
    uploadedDatasetIDs: ({ uploadedDatasetIDs }, { state: { context: { uploadResults }, matches } }) => { 
      return matches('inputReady') ? (
        R.compose(
          R.ifElse(
            RA.isNotNil,
            R.append(R.__, uploadedDatasetIDs),
            R.always(uploadedDatasetIDs)
          ),
          R.prop('datasetID'),
          R.prop('createDataset'),
          R.prop('data')
        )(uploadResults)
      ) : (
        uploadedDatasetIDs
      )
    }
  }) : undefined
)

// Initialize the dataset upload actors, one for each dataset that is being uploaded
const datasetUploadInit = assign({
  datasetUploadActors: ({ createDataset }, { datasets }) => R.addIndex(R.map)(
    (_, inputIndex) => spawn(InputUploadMachine({
      inputIndex,
      isActor: true,
      uploadFunction: createDataset
    }), { sync: true }),
    datasets
  ),
  datasetUploadStatuses: (_, { datasets }) => R.repeat('pending', R.length(datasets))
})

// Remove the given dataset ID from the list of uploaded dataset IDs
const removeUploadedDatasetID = assign({
  uploadedDatasetIDs: ({ uploadedDatasetIDs }, { datasetID }) => R.without([datasetID], uploadedDatasetIDs)
})

// Reset project data in preparation of a new project
const resetProject = assign({
  datasetUploadActors: [],
  datasetUploadStatuses: [],
  mergedProjectIDs: [],
  projectName: '',
  projectDescription: '',
  uploadedDatasetIDs: []
})

// Re-attempt to upload a dataset that has failed to upload
const retryUploadDataset = pure(({ datasetUploadActors }, { dataset, datasetIndex }) => send({
  type: 'UPLOAD_INPUT',
  uploadOptions: dataset
}, { to: datasetUploadActors[datasetIndex] }))

// Set the dataset's upload status according to the respective dataset upload actor's state
const setDatasetUploadStatus = pure(
  (_, event) => 'state' in event ? assign({
    datasetUploadStatuses: ({ datasetUploadStatuses }, { state: { context: { inputIndex }, matches } }) => {
      return R.update(
        inputIndex,
        matches('inputReady') ? 'success' :
        matches('inputFailed') ? 'failed' :
        matches('inputProcessing') ? 'loading' :
        'pending',
        datasetUploadStatuses
      )
    }
  }) : undefined
)

// Toggle the project ID from the list of integrated projects
const toggleMergedProjectID = assign({
  mergedProjectIDs: ({ mergedProjectIDs }, { projectID }) => R.ifElse(
    R.includes(projectID),
    R.without([projectID]),
    R.append(projectID)
  )(mergedProjectIDs)
})

// Update the project's description
const updateProjectDescription = assign({
  projectDescription: (_, { projectDescription }) => projectDescription
})

// Update the project's name
const updateProjectName = assign({
  projectName: (_, { projectName }) => projectName
})

// Send the dataset to the the corresponding dataset upload actor
const uploadDatasets = pure(({ datasetUploadActors }, { datasets }) => R.addIndex(R.map)(
  (datasetUploadActor, index) => send({
    type: 'UPLOAD_INPUT',
    uploadOptions: datasets[index]
  }, { to: datasetUploadActor }),
  datasetUploadActors
))

export {
  addUploadedDatasetID,
  datasetUploadInit,
  removeUploadedDatasetID,
  resetProject,
  retryUploadDataset,
  setDatasetUploadStatus,
  toggleMergedProjectID,
  updateProjectDescription,
  updateProjectName,
  uploadDatasets
}