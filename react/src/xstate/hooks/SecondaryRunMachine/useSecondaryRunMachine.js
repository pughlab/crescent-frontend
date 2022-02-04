import { useCallback, useEffect } from 'react'
import { useActor, useInterpret } from '@xstate/react'
import { SecondaryRunMachine } from '../../machines'
import { useDispatch } from 'react-redux'
import * as R from 'ramda'
import { setAnnotationsService } from '../../../redux/actions/machineServices'
import { useMachineServices } from '../../../redux/hooks'

/**
 * Hook for initializing the `SecondaryRunMachine` and dispatching the service to Redux.
 * @returns {import('xstate').Interpreter} The `SecondaryRunMachine` interpreter.
 */
const useSecondaryRunMachine = () => {
  const dispatch = useDispatch()
  const { annotationsService } = useMachineServices()
  // Create service from the SecondaryRunMachine
  const initialService = useInterpret(SecondaryRunMachine)

  // Save the service to Redux
  useEffect(() => {
    dispatch(setAnnotationsService({ service: initialService }))
  }, [dispatch, initialService])

  return annotationsService
}

/**
 * Hook for accessing helper functions for sending XState events to the `SecondaryRunMachine`.
 */
const useSecondaryRunEvents = () => {
  const { annotationsService: service } = useMachineServices()
  const [, send] = useActor(service)
  
  const annotationTypeInit = useCallback(
    /**
     * Initialize the newly selected annotation type.
     * @param {object} payload - Payload for the `ANNOTATION_TYPE_INIT` event being sent to the `SecondaryRunMachine`.
     * @param {string} payload.annotationType - The annotation type (e.g. `GSVA`, `InferCNV`, `Metadata`, etc.).
     * @param {(function(any): boolean)[]} payload.inputConditions - An array of predicates. Each input must satisfy its respective predicate (according to the input's `inputIndex`) before the secondary run can be submitted.
     * @param {string[]} [payload.inputChecklistLabels] - Labels for the input upload status checklist, one for each input.
     * @param {function(): void} [payload.onComplete] - The function that is called when the secondary run has completed (regardless of whether it succeeded or failed).
     * @param {function(object): Promise} [payload.submitFunction] - The submission function for the secondary run. The function should return a promise that resolves if the secondary run was successfully submitted or rejects if the submission failed. This can be omitted if `submittable` is false.
     * @param {boolean} [payload.submittable] - A booleam flag indicating whether or not the secondary run can or needs to be submitted (e.g. the `Metadata` annotation type is non-submittable). `submitFunction` can be omitted if `submittable` is false.
     * @param {(function(object): Promise)[]} payload.uploadFunctions - Functions for handling input upload, one for each input. Each function should take in an options object as a parameter and return a promise. The promise should resolve (with the upload results which will be verified with the input's respective `inputcondition`) if the upload was successful or reject if an error occurred.
     */
    ({
      annotationType,
      inputConditions,
      inputChecklistLabels,
      onComplete,
      submitFunction,
      submittable,
      uploadFunctions
    }) => {
      send({
        type: 'ANNOTATION_TYPE_INIT',
        annotationType,
        inputConditions,
        inputChecklistLabels,
        onComplete,
        submitFunction,
        submittable,
        uploadFunctions
      })
    }, [send])

  const cancelSecondaryRunInit = useCallback(
    /**
     * Initialize the cancel function for the current secondary run.
     * @param {object} payload - Payload for the `CANCEL_SECONDARY_RUN_INIT` event being sent to the `SecondaryRunMachine`.
     * @param {function(object): Promise} [payload.cancelFunction] - The cancelation function for the secondary run. The function should take in an options object and return a promise. The promise should resolve if the secondary run was successfully canceled or reject if the cancelation failed.
     */
    ({ cancelFunction }) => {
      send({
        type: 'CANCEL_SECONDARY_RUN_INIT',
        cancelFunction
      })
    }, [send])

  const cancelSecondaryRun = useCallback(
    /**
     * Cancel the current secondary run.
     * @param {object} payload - Payload for the `CANCEL_SECONDARY_RUN` event being sent to the `SecondaryRunMachine`.
     * @param {object} [payload.cancelOptions] - Options passed to the secondary run cancelation mutation function.
     * @param {object} [payload.cancelOptions.variables] - Any variable(s) required for the secondary run cancelation mutation function.
     */
    ({ cancelOptions }) => {
      send({
        type: 'CANCEL_SECONDARY_RUN',
        cancelOptions
      })
    }, [send])

  const submitSecondaryRun = useCallback(
    /**
     * Submit the secondary run.
     */
    () => {
      send({ type: 'SUBMIT_SECONDARY_RUN' })
    }, [send])

  const updateLogs = useCallback(
    /**
     * Update the logs for the current secondary run.
     * @param {object} payload - Payload for the `UPDATE_LOGS` event being sent to the `SecondaryRunMachine`.
     * @param {string} payload.logs - The updated secondary run logs. 
     */
    ({ logs }) => {
      send({
        type: 'UPDATE_LOGS',
        logs
      })
    }, [send])

  const updateStatus = useCallback(
    /**
     * Update the status of the current secondary run.
     * @param {object} payload - Payload for the status update (e.g. `SECONDARY_RUN_SUBMITTED`, etc.) event being sent to the `SecondaryRunMachine`.
     * @param {string} [payload.secondaryRunWesID] - The WES ID of the secondary run.
     * @param {string} payload.status - The status (e.g. `submitted`, etc.) of the secondary run.
     */
    ({ secondaryRunWesID, status }) => {
      send({
        type: `SECONDARY_RUN_${R.toUpper(status)}`,
        secondaryRunWesID
      })
    }, [send])

   const uploadInput = useCallback(
    /**
     * Upload the input for the current secondary run.
     * @param {object} payload - Payload for the `INPUT_UPLOAD` event being sent to the `SecondaryRunMachine`.
     * @param {number} [payload.inputIndex] - The index of the input to be uploaded with respect to the `uploadFunctions` array. I.e. the first input would have an inputIndex of 0, etc.
     * @param {object} [payload.uploadOptions] - Options passed to the upload mutation function.
     * @param {boolean} [payload.uploadOptions.newUpload] - A boolean flag indicating whether or not the input is a new upload.
     * @param {object} [payload.uploadOptions.variables] - Any variable(s) required for the upload mutation function.
     */ 
    ({ inputIndex, uploadOptions }) => {
      send({
        type: 'UPLOAD_INPUT',
        inputIndex,
        uploadOptions
      })
    }, [send])

  return {
    annotationTypeInit,
    cancelSecondaryRunInit,
    cancelSecondaryRun,
    submitSecondaryRun,
    updateLogs,
    updateStatus,
    uploadInput
  }
}

export default useSecondaryRunMachine
export { useSecondaryRunEvents }