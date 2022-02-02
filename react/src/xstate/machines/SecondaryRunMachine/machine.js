import { createMachine } from 'xstate'
import {
  annotationTypeInit,
  onComplete,
  onCompleteReset,
  sendInputToActor,
  sendUploadFunctionToActors,
  setCancelFunction,
  setInputReady,
  setLogs,
  setSecondaryRunWesID,
  setSubmittedSecondaryRunWesID
} from './actions'
import {
  isAllInputsReady,
  isCancelSuccess,
  isNonSubmittable,
  isSubmitSuccess
} from './guards'
import * as RA from 'ramda-adjunct'

// State machine for handling the lifecycle of a secondary run
const SecondaryRunMachine = createMachine({
  id: 'SecondaryRunMachine',
  initial: 'inputsPending',
  context: {
    annotationType: null, // The current annotation type (e.g. 'GSVA', 'InferCNV', 'Metadata', etc.)
    cancelFunction: () => RA.rejectP, // Function for canceling the secondary run
    inputActors: [], // Array of actors that handle the respective input
    inputChecklistLabels: [], // Labels for the input upload status checklist (in the sidebar)
    inputsReady: [], // Array of boolean flags indicating whether the respective input is submitted and valid
    logs: null, // Secondary run logs
    onComplete: RA.noop, // Function to run when the secondary run has completed (whether it was successful or a failure)
    secondaryRunWesID: null, // The WES ID of the secondary run
    submitFunction: () => RA.rejectP, // Function for submitting the secondary run
    submittable: true // Boolean flag indiciating whether or not the secondary needs to be submitted (i.e. metadata upload has no secondary run to submit, so the flag should be set to 'false' for it)
  },
  // ROOT NODE TRANSITIONS (apply to all states, unless specified as a forbidden transition in a specific state)
  on: {
    // Annotation type switch
    ANNOTATION_TYPE_INIT: {
      target: 'inputsPending',
      actions: ['annotationTypeInit', 'sendUploadFunctionToActors']
    },
    // Set the cancel function
    CANCEL_SECONDARY_RUN_INIT: {
      actions: 'setCancelFunction',
      internal: true
    },
    // Updated logs are available
    UPDATE_LOGS: {
      actions: 'setLogs',
      internal: true
    }
  },
  states: {
    // INITIAL STATE: one or more input needs to be uploaded or is invalid
    inputsPending: {
      on: {
        // A secondary run for the current annotation type has already been submitted
        SECONDARY_RUN_SUBMITTED: {
          target: 'secondaryRunSubmitted',
          actions: 'setSubmittedSecondaryRunWesID'
        },
        // An input is being uploaded or re-uploaded
        UPLOAD_INPUT: {
          actions: 'sendInputToActor'
        },
        // When receiving an update from an input actor, set 'inputReady' accordingly
        // and transition to the 'inputsValidating' state to validate the inputs
        'xstate.update': {
          target: 'inputsValidating',
          actions: 'setInputReady'
        }
      }
    },
    // STATE: validate whether or not all of the inputs are ready (uploaded and valid)
    inputsValidating: {
      // EVENTLESS TRANSITION
      always: [
        // Non-submittable runs only - if the input is uploaded and valid, automatically transition back to 'inputsPending'
        {
          target: 'inputsPending',
          cond: 'isNonSubmittable',
          actions: 'onComplete'
        },
        // If all of the inputs are ready (uploaded and valid), automatically transition to 'inputsReady'
        {
          target: 'inputsReady',
          cond: 'isAllInputsReady'
        },
        // Otherwise, one or more input is missing or invalid, so automatically transition back to 'inputsPending'
        'inputsPending'
      ],
      on: {
        // An input is being uploaded or re-uploaded
        UPLOAD_INPUT: {
          actions: 'sendInputToActor'
        },
        // When receiving an update from an input actor, set 'inputReady' accordingly
        // and transition to the 'inputsValidating' state to validate the inputs
        'xstate.update': {
          target: 'inputsValidating',
          actions: 'setInputReady'
        }
      }
    },
    // STATE: all required inputs have been uploaded and are valid
    inputsReady: {
      on: {
        // The run is being submitted (the 'submitProcessing' state will handle the submission)
        SUBMIT_SECONDARY_RUN: 'submitProcessing',
        // An input is being uploaded or re-uploaded
        UPLOAD_INPUT: {
          actions: 'sendInputToActor'
        },
        // When receiving an update from an input actor, set 'inputReady' accordingly
        // and transition to the 'inputsValidating' state to validate the inputs
        'xstate.update': {
          target: 'inputsValidating',
          actions: 'setInputReady'
        }
      }
    },
    // STATE: invoke the submit function to submit the secondary run
    submitProcessing: {
      invoke: {
        id: 'submitSecondaryRun',
        // Call the submission function to submit the secondary run
        src: ({ submitFunction }, _) => submitFunction(),
        // If the promise resolves, the submission was successful, so transition to the 'submitValidating' state for submission validation
        onDone: {
          target: 'submitValidating',
          actions: 'setSecondaryRunWesID'
        },
        // If the promise rejects, the submission has failed, so transition back to 'submitFailed'
        onError: 'submitFailed'
      }
    },
    // STATE: validate whether or not the secondary run has been successfully submitted
    submitValidating: {
      // EVENTLESS TRANSITION
      always: [
        // If the secondary run WES ID has been set, the secondary run has been successfully submitted,
        // so automatically transition to 'inputsReady'
        {
          target: 'secondaryRunSubmitted',
          cond: 'isSubmitSuccess'
        },
        // Otherwise, the secondary run submission has failed, so transition back to 'inputsReady'
        'inputsReady'
      ]
    },
    // STATE: the secondary run submission has failed
    submitFailed: {
      on: {
        // The run is being re-submitted (the 'submitProcessing' state will handle the submission)
        SUBMIT_SECONDARY_RUN: 'submitProcessing',
        // An input is being uploaded or re-uploaded
        UPLOAD_INPUT: {
          actions: 'sendInputToActor'
        },
        // When receiving an update from an input actor, set 'inputReady' accordingly
        // and transition to the 'inputsValidating' state to validate the inputs
        'xstate.update': {
          target: 'inputsValidating',
          actions: 'setInputReady'
        }
      }
    },
    // STATE: the secondary run has been submitted
    secondaryRunSubmitted: {
      on: {
        // The run is being canceled (the 'cancelProcessing' state will handle the cancellation)
        CANCEL_SECONDARY_RUN: 'cancelProcessing',
        // The secondary run has successfully completed
        SECONDARY_RUN_COMPLETED: {
          target: 'inputsPending',
          actions: ['onComplete', 'onCompleteReset']
        },
        // The secondary run has failed
        SECONDARY_RUN_FAILED: {
          target: 'inputsPending',
          actions: ['onComplete', 'onCompleteReset']
        },
        // FORBIDDEN TRANSITION: the secondary run status has yet to change from 'submitted'
        SECONDARY_RUN_SUBMITTED: undefined,
        // FORBIDDEN TRANSITION: input(s) can't be uploaded or re-uploaded once the secondary run has been submitted
        UPLOAD_INPUT: undefined,
      }
    },
    // STATE: invoke the cancel function to cancel the submitted secondary run
    cancelProcessing: {
      invoke: {
        id: 'cancelSecondaryRun',
        // Call the cancel function with the provided cancelOptions
        src: ({ cancelFunction }, { cancelOptions }) => cancelFunction(cancelOptions),
        // If the promise resolves...
        onDone: [
          // Transition to 'secondaryRunCanceled' if the secondary run cancelation was successful
          {
            target: 'secondaryRunCanceled',
            cond: 'isCancelSuccess'
          },
          // Otherwise, the secondary run cancelation has failed, so transition to 'cancelFailed'
          'cancelFailed'
        ],
        // If the promise rejects, the secondary run cancelation has failed, so transition to 'cancelFailed'
        onError: 'cancelFailed'
      }
    },
    // STATE: the secondary run cancelation has failed
    cancelFailed: {
      on: {
        // Another attempt is being made to cancel the secondary run (the 'cancelProcessing' state will handle the cancellation)
        CANCEL_SECONDARY_RUN: 'cancelProcessing',
        // The secondary run has successfully completed
        SECONDARY_RUN_COMPLETED: {
          target: 'inputsPending',
          actions: ['onComplete', 'onCompleteReset']
        },
        // The secondary run has failed
        SECONDARY_RUN_FAILED: {
          target: 'inputsPending',
          actions: ['onComplete', 'onCompleteReset']
        }
      }
    },
    // STATE: the secondary run has been canceled, awaiting MongoDB status update ('submitted' -> 'failed')
    secondaryRunCanceled: {
      on: {
        // The status has been updated to 'failed' in MongoDB, so transition to 'inputsPending' awaiting a new secondary run
        SECONDARY_RUN_FAILED: {
          target: 'inputsPending',
          actions: ['onComplete', 'onCompleteReset']
        }
      }
    }
  }
}, {
  actions: {
    annotationTypeInit,
    onComplete,
    onCompleteReset,
    sendInputToActor,
    sendUploadFunctionToActors,
    setCancelFunction,
    setInputReady,
    setLogs,
    setSecondaryRunWesID,
    setSubmittedSecondaryRunWesID
  },
  guards: {
    isAllInputsReady,
    isCancelSuccess,
    isNonSubmittable,
    isSubmitSuccess
  }
})

export default SecondaryRunMachine