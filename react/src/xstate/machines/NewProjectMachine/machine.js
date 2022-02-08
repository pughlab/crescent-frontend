import { createMachine } from 'xstate'
import {
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
} from './actions'
import {
  isAllInputsReady
} from './guards'

// State machine for handling the creation of a new project
const NewProjectMachine = ({ createDataset, createMergedProject }) => createMachine({
  id: 'NewProjectMachine',
  initial: 'inputsPending',
  context: {
    createDataset, // Function for creating a new dataset
    createMergedProject, // Function for creating a new merged project
    datasetUploadActors: [], // Array of actors that handle dataset uploads
    datasetUploadStatuses: [], // Array of statuses for the dataset uploads, one each dataset upload actor
    mergedProjectIDs: [], // Array of IDs of projects that have been selected for integration
    projectName: '', // The name of the new project
    projectDescription: '', // The description of the new project
    uploadedDatasetIDs: [] // Array of IDs of datasets that have been uploaded
  },
  // ROOT NODE TRANSITIONS (apply to all states, unless specified as a forbidden transition in a specific state)
  on: {
    // Remove an uploaded dataset
    REMOVE_UPLOADED_DATASET: {
      target: 'inputsValidating',
      actions: 'removeUploadedDatasetID'
    },
    // Reset the project data
    RESET_PROJECT: {
      target: 'inputsPending',
      actions: 'resetProject'
    },
    // Re-attempt to upload a dataset that failed to upload
    RETRY_UPLOAD_DATASET: {
      actions: 'retryUploadDataset'
    },
    // Toggle a project for integration
    TOGGLE_MERGED_PROJECT: {
      target: 'inputsValidating',
      actions: 'toggleMergedProjectID'
    },
    // Update the project description
    UPDATE_PROJECT_DESCRIPTION: {
      target: 'inputsValidating',
      actions: 'updateProjectDescription'
    },
    // Update the project name
    UPDATE_PROJECT_NAME: {
      target: 'inputsValidating',
      actions: 'updateProjectName'
    },
    // Upload the provided datasets
    UPLOAD_DATASETS: {
      actions: ['datasetUploadInit', 'uploadDatasets']
    },
    // When receiving an update from a dataset input actor, set the dataset's upload status accordingly
    // and add the dataset's ID to the list of uploaded dataset IDs (if the dataset upload has succeeded)
    'xstate.update': {
      target: 'inputsValidating',
      actions: ['setDatasetUploadStatus', 'addUploadedDatasetID']
    }
  },
  states: {
    // INITIAL STATE: one or more of the following inputs are invalid:
    // (project name; project description; and at least one existing project selected for integration, or at least one uploaded datasets)
    inputsPending: {
      entry: undefined
    },
    // STATE: validate whether or not all of the inputs have been provided
    inputsValidating: {
      always: [
        // If all of the inputs have been provided, automatically transition 'projectCreationReady'
        {
          target: 'projectCreationReady',
          cond: 'isAllInputsReady'
        },
        // Otherwise, one or more input has yet to be provided, so automatically transition back to 'inputsPending'
        'inputsPending'
      ]
    },
    // STATE: all required inputs have been provided
    projectCreationReady: {
      on: {
        // The project is being created
        CREATE_PROJECT: 'projectCreationPending'
      }
    },
    // STATE: invoke the createMergedProject function to create a new project
    projectCreationPending: {
      invoke: {
        id: 'createProject',
        // Call the project creation function to create a new project
        src: ({
          createMergedProject,
          mergedProjectIDs,
          projectDescription,
          projectName,
          uploadedDatasetIDs
        }, { userID }) => createMergedProject({
          variables: {
            userID,
            name: projectName,
            description: projectDescription,
            projectIDs: mergedProjectIDs,
            datasetIDs: uploadedDatasetIDs,
          }
        }),
        // If the promise resolves, the project was successfully created, so transition to 'projectCreated'
        onDone: 'projectCreated',
        // If the promise rejects, the project creation has failed, so transition to 'projectCreationFailed'
        onError: 'projectCreationFailed'
      }
    },
    // STATE: The project creation has failed
    projectCreationFailed: {
      on: {
        // Another attempt is being made to create the project
        CREATE_PROJECT: 'projectCreationPending'
      }
    },
    // FINAL STATE: the project has been successfully created
    projectCreated: {
      type: 'final'
    }
  }
}, {
  actions: {
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
  },
  guards: {
    isAllInputsReady
  }
})

export default NewProjectMachine