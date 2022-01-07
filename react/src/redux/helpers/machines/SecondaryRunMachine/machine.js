import { createMachine, sendUpdate } from 'xstate'
import {
  annotationTypeInit,
  onComplete,
  onCompleteReset,
  sendInputToActor,
  sendUploadFunctionToActors,
  setCancelFunction,
  setInputFailed,
  setInputReady,
  setLogs,
  setSecondaryRunWesID,
  setSubmittedSecondaryRunWesID,
  setUploadFunction
} from './actions'
import {
  isAllInputsReady,
  isCancelSuccess,
  isInputValid,
  isNonSubmittable,
  isSubmitSuccess
} from './guards'

// State machine for handling a secondary run input (used internally by the SecondaryRunMachine)
export const SecondaryRunInputMachine = (inputCondition, inputIndex) => createMachine({
  id: `SecondaryRunInputMachine-${inputIndex}`,
  initial: 'inputPending',
  context: {
    inputCondition, // A predicate that checks if the input is valid
    inputIndex, // The index of the input with regards to all inputs (i.e. first input should have an inputIndex of 0, etc.)
    upload: null // Function for uploading the input
  },
  states: {
    // INITIAL STATE: the input is pending (no input has been submitted or the input that was submitted is invalid)
    inputPending: {
      on: {
        // Set the upload function
        SET_UPLOAD_FUNCTION: {
          actions: 'setUploadFunction',
          internal: true
        },
        // The input is being uploaded (the 'inputProcessing' state will handle the upload)
        UPLOAD_INPUT: 'inputProcessing'
      }
    },
    // STATE: invoke the upload function and transition based on whether the upload function's promise resolves or rejects
    inputProcessing: {
      entry: sendUpdate(),
      invoke: {
        id: `uploadInput-${inputIndex}`,
        // Call the input upload function with the provided uploadOptions
        src: ({ upload }, { uploadOptions }) => upload(uploadOptions),
        // If the promise resolves, the upload was successful
        onDone: [
          // Transition to 'inputReady' if the input is valid (i.e. it satisfies its corresponding inputCondition)
          {
            target: 'inputReady',
            cond: 'isInputValid'
          },
          // Otherwise, the input is invalid, so transition back to 'inputPending'
          'inputPending'
        ],
        // If the promise rejects, the upload has failed, so transition to 'inputFailed'
        onError: {
          target: 'inputFailed',
          // Send update to parent (SecondaryRunMachine) machine to let it know that the upload has failed
          actions: 'setInputFailed'
        }
      }
    },
    // STATE: input upload failed
    inputFailed: {
      // Send update to the parent machine to let it know that the upload has failed
      entry: sendUpdate(),
      on: {
        // Set the upload function
        SET_UPLOAD_FUNCTION: {
          actions: 'setUploadFunction'
        },
        // The input is being reuploaded (the 'inputProcessing' state will handle the upload)
        UPLOAD_INPUT: 'inputProcessing'
      }
    },
    // STATE: the currently submitted input is valid
    inputReady: {
      // Send update to the parent (SecondaryRunMachine) machine to let it know that the upload was successful
      entry: sendUpdate(),
      on: {
        // Set the upload function
        SET_UPLOAD_FUNCTION: {
          target: 'inputPending',
          actions: 'setUploadFunction'
        },
        // The input is being reuploaded (the 'inputProcessing' state will handle the upload)
        UPLOAD_INPUT: 'inputProcessing'
      }
    }
  }
}, {
  actions: {
    setInputFailed,
    setUploadFunction
  },
  guards: {
    isInputValid
  }
})

// State machine for handling the lifecycle of a secondary run
const SecondaryRunMachine = createMachine({
  id: 'SecondaryRunMachine',
  initial: 'annotationTypePending',
  context: {
    annotationType: null, // The current annotation type (e.g. 'GSVA', 'InferCNV', 'Metadata', etc.)
    cancelFunction: () => {}, // Function for canceling the secondary run
    inputActors: [], // Array of actors that handle the respective input
    inputChecklistLabels: [], // Labels for the input upload status checklist (in the sidebar)
    inputsReady: [], // Array of boolean flags indicating whether the respective input is submitted and valid
    logs: null, // Secondary run logs
    onComplete: () => {}, // Function to run when the secondary run has completed (whether it was successful or a failure)
    secondaryRunWesID: null, // The WES ID of the secondary run
    submitFunction: () => {}, // Function for submitting the secondary run
    submittable: true // Boolean flag indiciating whether or not the secondary needs to be submitted (i.e. metadata upload has no secondary run to submit, so the flag should be set to 'false' for it)
  },
  states: {
    // INITIAL STATE: awaiting annotation type assignment
    annotationTypePending: {
      on: {
        // Annotation type switch
        ANNOTATION_TYPE_INIT: 'annotationTypeInit',
        // Set the cancel function
        CANCEL_SECONDARY_RUN_INIT: {
          actions: 'setCancelFunction',
          internal: true
        }
      }
    },
    // STATE: Switching annotation type
    annotationTypeInit: {
      // ENTRY ACTIONS: set the annotation type and send each upload function to its respective actor
      entry: ['annotationTypeInit', 'sendUploadFunctionToActors'],
      // EVENTLESS TRANSITION: always transition to 'inputsPending' once the annotation type has been switched
      always: 'inputsPending'
    },
    // STATE: one or more input needs to be uploaded or is invalid
    inputsPending: {
      on: {
        // Annotation type switch
        ANNOTATION_TYPE_INIT: 'annotationTypeInit',
        // Set the cancel function
        CANCEL_SECONDARY_RUN_INIT: {
          actions: 'setCancelFunction',
          internal: true
        },
        // The run has already been submitted and logs are available
        LOGS_UPDATE: {
          target: 'secondaryRunSubmitted',
          actions: 'setLogs'
        },
        // The run has already been submitted
        SECONDARY_RUN_SUBMITTED: 'secondaryRunSubmitted',
        // Set the WES ID of the secondary run
        SET_SECONDARY_RUN_WES_ID: {
          actions: 'setSubmittedSecondaryRunWesID'
        },
        // An input is being uploaded, so send the input to the appropriate input actor (which will handle the upload)
        UPLOAD_INPUT: {
          actions: 'sendInputToActor',
          internal: true
        },
        // When receiving an update from an input actor, set 'inputReady' accordingly
        // and transition to the 'inputsValidating' state to validate the inputs
        'xstate.update': {
          target: 'inputsValidating',
          actions: 'setInputReady'
        },
        // WILDCARD TRANSITION: for 'SECONDARY_RUN_COMPLETED' or 'SECONDARY_RUN_FAILED' events
        '*': 'inputsPending'
      }
    },
    // STATE: validate whether or not all of the inputs are valid
    inputsValidating: {
      // EVENTLESS TRANSITION
      always: [
        // If the inputs are all valid, automatically transition to 'inputsReady'
        {
          target: 'inputsReady',
          cond: 'isAllInputsReady'
        },
        // Otherwise, the input(s) is/are invalid, so automatically transition back to 'inputsPending'
        'inputsPending'
      ]
    },
    // STATE: all required inputs have been uploaded and are valid
    inputsReady: {
      // EVENTLESS TRANSITION:
      // for non-submittable annotation types, immediately transition to 'inputsPending' if the input is uploaded and valid
      // as the user does not need to explicitly submit the secondary run
      always: {
        target: 'inputsPending',
        cond: 'isNonSubmittable',
        actions: ['onComplete', 'onCompleteReset']
      },
      on: {
        // Annotation type switch
        ANNOTATION_TYPE_INIT: 'annotationTypeInit',
        // Set the cancel function
        CANCEL_SECONDARY_RUN_INIT: {
          actions: 'setCancelFunction',
          internal: true
        },
        // The run has already been submitted and logs are available
        LOGS_UPDATE: {
          target: 'secondaryRunSubmitted',
          actions: 'setLogs'
        },
        // The run has already been submit (NOTE: this is different from the 'SUBMIT_SECONDARY_RUN' event)
        SECONDARY_RUN_SUBMITTED: 'secondaryRunSubmitted',
        // Set the WES ID of the secondary run
        SET_SECONDARY_RUN_WES_ID: {
          actions: 'setSubmittedSecondaryRunWesID'
        },
        // The run is being submitted (the 'submitProcessing' state will handle the submission)
        SUBMIT_SECONDARY_RUN: 'submitProcessing',
        // An input has been uploaded, so send the input to the appropriate input actor
        UPLOAD_INPUT: {
          actions: 'sendInputToActor'
        },
        // An input has been uploaded, so re-validate the inputs to ensure that they are still all valid
        'xstate.update': {
          target: 'inputsValidating',
          actions: 'setInputReady'
        },
        // WILDCARD TRANSITION: for 'INPUT_SUCCESS' or 'INPUT_FAILED' events
        '*': {
          target: 'inputsPending',
          actions: 'sendInputToActor'
        }
      }
    },
    // STATE: invoke the submit function to submit the secondary run
    submitProcessing: {
      invoke: {
        id: 'submitSecondaryRun',
        // Submit the secondary run
        src: ({ submitFunction }, _) => submitFunction(),
        // If the promise resolves, the submission was successfuly, so transition to the 'submitValidating' state for submission validation
        onDone: {
          target: 'submitValidating',
          actions: 'setSecondaryRunWesID'
        },
        // If the promise rejects, the submission has failed, so transition back to 'inputsReady'
        onError: 'inputsReady'
      },
      on: {
        // Annotation type switch
        ANNOTATION_TYPE_INIT: 'annotationTypeInit',
        // Logs are available
        LOGS_UPDATE: {
          actions: 'setLogs',
          internal: true
        }
      }
    },
    // State: validate whether or not the secondary run has sucessfully been submitted
    submitValidating: {
      // EVENTLESS TRANSITION
      always: [
        // If a secondary run Wes ID has been set then the run has successfully been submitted,
        // so automatically transition to 'inputsReady'
        {
          target: 'secondaryRunSubmitted',
          cond: 'isSubmitSuccess'
        },
        // Otherwise, the run submission has failed, so transition back to 'inputsReady'
        'inputsReady'
      ]
    },
    // STATE: secondary run has been submitted
    secondaryRunSubmitted: {
      on: {
        // Annotation type switch
        ANNOTATION_TYPE_INIT: 'annotationTypeInit',
        // The run is being canceled (the 'cancelProcessing' state will handle the cancellation)
        CANCEL_SECONDARY_RUN: 'cancelProcessing',
        // Set the cancel function
        CANCEL_SECONDARY_RUN_INIT: {
          actions: 'setCancelFunction',
          internal: true
        },
        // Updated logs are available
        LOGS_UPDATE: {
          actions: 'setLogs',
          internal: true
        },
        // FORBIDDEN TRANSITION: the run status hasn't changed from 'submitted'
        SECONDARY_RUN_SUBMITTED: undefined,
        // FORBIDDEN TRANSITION: the WES ID doesn't need to be updated if the run has already been submitted
        SET_SECONDARY_RUN_WES_ID: undefined,
        // FORBIDDEN TRANSITION: input can't be uploaded after the run has been submitted
        UPLOAD_INPUT: undefined,
        // WILDCARD TRANSITION: for 'SECONDARY_RUN_COMPLETED' or 'SECONDARY_RUN_FAILED' events
        '*': {
          target: 'inputsPending',
          actions: ['onComplete', 'onCompleteReset']
        }
      }
    },
    // STATE: invoke the cancel function to cancel the submitted secondary run
    cancelProcessing: {
      invoke: {
        id: 'cancelSecondaryRun',
        // Call the input upload function with the provided uploadOptions
        src: ({ cancelFunction }, { cancelOptions }) => cancelFunction(cancelOptions),
        // If the promise resolves...
        onDone: [
          // Transition to 'secondaryRunCanceled' if the cancelation was successful
          {
            target: 'secondaryRunCanceled',
            cond: 'isCancelSuccess'
          },
          // Otherwise, transition back to 'secondaryRunSubmitted'
          'secondaryRunSubmitted'
        ],
        // If the promise rejects, the upload has failed, so transition to 'inputFailed'
        onError: 'cancelFailed'
      },
      on: {
        // Annotation type switch
        ANNOTATION_TYPE_INIT: 'annotationTypeInit',
        // Updated logs are available
        LOGS_UPDATE: {
          actions: 'setLogs',
          internal: true
        }
      }
    },
    // STATE: secondary run cancelation has failed
    cancelFailed: {
      on: {
        // Annotation type switch
        ANNOTATION_TYPE_INIT: 'annotationTypeInit',
        // Set the cancel function
        CANCEL_SECONDARY_RUN_INIT: {
          actions: 'setCancelFunction',
          internal: true
        },
        // Updated logs are available
        LOGS_UPDATE: {
          actions: 'setLogs',
          internal: true
        }
      }
    },
    // STATE: secondary run has been canceled awaiting MongoDB status update ('submitted' -> 'failed')
    secondaryRunCanceled: {
      on: {
        // Annotation type switch
        ANNOTATION_TYPE_INIT: 'annotationTypeInit',
        CANCEL_SECONDARY_RUN_INIT: {
          actions: 'setCancelFunction',
          internal: true
        },
        // Updated logs are available
        LOGS_UPDATE: {
          actions: 'setLogs',
          internal: true
        },
        // The status has been updated to 'failed' in MongoDB, so transition to 'inputsPending', pending a new secondary run
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