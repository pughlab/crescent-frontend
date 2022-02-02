import { actions, createMachine, sendUpdate } from 'xstate'
import {
  setUploadFunction
} from './actions'
import {
  isInputValid
} from './guards'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const { pure } = actions

// State machine for handling an input's upload lifecycle
const InputUploadMachine = ({
  inputCondition=R.T,
  inputIndex=0,
  isActor=false,
  uploadFunction=() => RA.rejectP()
}) => createMachine({
  id: `InputUploadMachine-${inputIndex}`,
  initial: 'inputPending',
  context: {
    inputCondition, // A predicate that checks if the input is valid
    inputIndex, // The index of the input with regards to all inputs (i.e. first input should have an inputIndex of 0, etc.)
    isActor, // Boolean flag indicating whether or not the machine is an actor
    uploadFunction // Function for uploading the input, this can be provided as a parameter to InputUploadMachine or provided as a payload for the 'SET_UPLOAD_FUNCTION' event
  },
  // ROOT NODE TRANSITIONS (apply to all states, unless specified as a forbidden transition in a specific state)
  on: {
    // Set the upload function
    SET_UPLOAD_FUNCTION: {
      actions: 'setUploadFunction',
      internal: true
    },
    // The input is being uploaded or re-uploaded (the 'inputProcessing' state will handle the upload)
    UPLOAD_INPUT: 'inputProcessing'
  },
  states: {
    // INITIAL STATE: the input is pending (no input has been uploaded or the input is invalid)
    inputPending: {
      entry: undefined
    },
    // STATE: invoke the upload function and transition based on whether the upload function's promise resolves or rejects
    inputProcessing: {
      // NOTE: only sends update to the parent machine if the machine is a spawned actor
      entry: pure(({ isActor }) => isActor ? sendUpdate() : undefined),
      invoke: {
        id: `uploadInput-${inputIndex}`,
        // Call the input upload function with the provided uploadOptions
        src: ({ uploadFunction }, { uploadOptions }) => uploadFunction(uploadOptions),
        // If the promise resolves, the input upload was successful
        onDone: [
          // Transition to 'inputReady' if the input is valid (i.e. it satisfies its corresponding inputCondition)
          {
            target: 'inputReady',
            cond: 'isInputValid'
          },
          // Otherwise, the input is invalid, so transition back to 'inputPending'
          'inputPending'
        ],
        // If the promise rejects, the input upload has failed, so transition to 'inputFailed'
        onError: 'inputFailed'
      },
      on: {
        // FORBIDDEN TRANSITIONS: can't set the upload function while the input is still being uploaded
        SET_UPLOAD_FUNCTION: undefined,
        // FORBIDDEN TRANSITION: the input can't be re-uploaded while it is still being uploaded
        UPLOAD_INPUT: undefined
      }
    },
    // STATE: the input upload has failed
    inputFailed: {
      // Send update to the parent machine to let it know that the input upload has failed
      // NOTE: only sends update to the parent machine if the machine is a spawned actor
      entry: pure(({ isActor }) => isActor ? sendUpdate() : undefined)
    },
    // STATE: the input is valid and uploaded
    inputReady: {
      // Send update to the parent machine to let it know that the upload was successful
      // NOTE: only sends update to the parent machine if the machine is a spawned actor
      entry: pure(({ isActor }) => isActor ? sendUpdate() : undefined)
    }
  }
}, {
  actions: {
    setUploadFunction
  },
  guards: {
    isInputValid
  }
})

export default InputUploadMachine