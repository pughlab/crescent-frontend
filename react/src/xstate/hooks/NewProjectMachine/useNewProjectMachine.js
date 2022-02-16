import { useCallback, useEffect } from 'react'
import { useActor, useInterpret } from '@xstate/react'
import { NewProjectMachine } from '../../machines'
import { useDispatch } from 'react-redux'
import { setNewProjectService } from '../../../redux/slices/machineServices'
import { useMachineServices } from '../../../redux/hooks'
import { useCreateDatasetMutation } from '../../../apollo/hooks/dataset'
import { useCreateMergedProjectMutation } from '../../../apollo/hooks/project'

/**
 * Hook for initializing the `NewProjectMachine` and dispatching the service to Redux.
 * @returns {import('xstate').Interpreter} The `NewProjectMachine` interpreter.
 */
const useNewProjectMachine = () => {
  const createDataset = useCreateDatasetMutation()
  const createMergedProject = useCreateMergedProjectMutation()

  const dispatch = useDispatch()
  const { newProjectService } = useMachineServices()
  // Create service from the SecondaryRunMachine
  const initialService = useInterpret(NewProjectMachine({ createDataset, createMergedProject }))

  // Save the service to Redux
  useEffect(() => {
    dispatch(setNewProjectService({ service: initialService }))
  }, [dispatch, initialService])

  return newProjectService
}

/**
 * Hook for accessing helper functions for sending XState events to the `NewProjectMachine`.
 */
const useNewProjectEvents = () => {
  const { newProjectService: service } = useMachineServices()
  const [, send] = useActor(service)

  /**
   * @typedef {object} Dataset
   * @property {object} variables - The variables required for 'createDataset' mutation.
   * @property {object} variables.barcodes - The `barcodes.tsv.gz` file being uploaded.
   * @property {object} variables.features - The `features.tsv.gz` file being uploaded.
   * @property {object} variables.matrix - The `matrix.mtx.gz` file being uploaded.
   * @property {string} variables.name - The directory name of the dataset.
   */

  const createProject = useCallback(
    /**
     * Create a new project with the user provided data.
     * @param {object} payload - Payload for the `CREATE_PROJECT` event being sent to the `NewProjectMachine`.
     * @param {string} payload.userID - The ID of the user creating the project. 
     */
    ({ userID }) => {
      send({
        type: 'CREATE_PROJECT',
        userID
      })
    }, [send]
  )

  const removeUploadedDataset = useCallback(
    /**
     * Remove an uploaded dataset from the list of uploaded dataset IDs.
     * @param {object} payload - Payload for the `REMOVE_UPLOADED_DATASET` event being sent to the `NewProjectMachine`.
     * @param {string} payload.datasetID - The ID of the uploaded dataset being removed.
     */
    ({ datasetID }) => {
      send({
        type: 'REMOVE_UPLOADED_DATASET',
        datasetID
      })
    }, [send])
  
  const resetProject = useCallback(
    /**
     * Reset project data in preparation of a new project.
     */
    () => {
      send({ type: 'RESET_PROJECT' })
    }, [send])

  const retryUploadDataset = useCallback(
    /**
     * Re-attempt to upload a dataset that has failed to upload.
     * @param {object} payload - Payload for the `RETRY_UPLOAD_DATASET` event being sent to the `NewProjectMachine`.
     * @param {Dataset} payload.dataset - The dataset being re-uploaded.
     * @param {number} payload.datasetIndex - The index of the dataset being re-uploaded.
     */
    ({ dataset, datasetIndex }) => {
      send({
        type: 'RETRY_UPLOAD_DATASET',
        dataset,
        datasetIndex
      })
    }, [send])

  const toggleMergedProject = useCallback(
    /**
     * Toggle an existing project for integration with the project being created.
     * @param {object} payload - Payload for the `TOGGLE_MERGED_PROJECT` event being sent to the `NewProjectMachine`.
     * @param {Dataset} payload.projectID - The ID of the project being integrated into the one being created.
     */
    ({ projectID }) => {
      send({
        type: 'TOGGLE_MERGED_PROJECT',
        projectID
      })
    }, [send])

  const updateProjectDescription = useCallback(
    /**
     * Update the project description.
     * @param {object} payload - Payload for the `UPDATE_PROJECT_DESCRIPTION` event being sent to the `NewProjectMachine`.
     * @param {string} payload.projectDescription - The updated project description.
     */ 
    ({ projectDescription }) => {
      send({
        type: 'UPDATE_PROJECT_DESCRIPTION',
        projectDescription
      })
    }, [send])

  const updateProjectName = useCallback(
    /**
     * Update the project name.
     * @param {object} payload - Payload for the `UPDATE_PROJECT_NAME` event being sent to the `NewProjectMachine`.
     * @param {string} payload.projectName - The updated project name.
     */
    ({ projectName }) => {
      send({
        type: 'UPDATE_PROJECT_NAME',
        projectName
      })
    }, [send])

    const uploadDatasets = useCallback(
      /**
       * Upload the provided datasets.
       * @param {object} payload - Payload for the `UPLOAD_DATASETS` event being sent to the `NewProjectMachine`.
       * @param {Dataset[]} payload.datasets - The dataset being re-uploaded.
       */
      ({ datasets }) => {
        send({
          type: 'UPLOAD_DATASETS',
          datasets
        })
      }, [send])

  return {
    createProject,
    removeUploadedDataset,
    resetProject,
    retryUploadDataset,
    toggleMergedProject,
    updateProjectDescription,
    updateProjectName,
    uploadDatasets
  }
}

export default useNewProjectMachine
export { useNewProjectEvents }