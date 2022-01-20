import { actions, assign, send, spawn } from 'xstate'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import { SecondaryRunInputMachine } from './machine'

const { pure } = actions

// Initialize the required context values when switching annotation type
const annotationTypeInit = assign({
  annotationType: (_, { annotationType }) => annotationType,
  inputActors: (_, { inputConditions=[] }) => R.addIndex(R.map)((inputCondition, inputIndex) => spawn(SecondaryRunInputMachine(inputCondition, inputIndex), { sync: true }), inputConditions),
  inputChecklistLabels: (_, { inputChecklistLabels=[] }) => inputChecklistLabels,
  inputsReady: (_, { inputConditions=[] }) => R.repeat(false, R.length(inputConditions)),
  logs: null,
  onComplete: (_, { onComplete=() => {} }) => onComplete,
  secondaryRunWesID: null,
  submitFunction: (_, { submitFunction=() => {} }) => submitFunction,
  submittable: (_, { submittable=true }) => submittable
})

// Call the onComplete function on secondary run completion (whether it was successful or a failure)
const onComplete = ({ onComplete }, _) => {
  onComplete()
}

// Reset specific context values on secondary run completion
const onCompleteReset = assign({
  inputsReady: ({ inputsReady }, _) => R.repeat('pending', R.length(inputsReady)),
  logs: RA.stubNull,
  secondaryRunWesID: RA.stubNull
})

// Send the input to the corresponding actor 
const sendInputToActor = send((_, { uploadOptions }) => ({
  type: 'UPLOAD_INPUT',
  uploadOptions
}), { to: ({ inputActors }, { inputIndex }) => inputActors[inputIndex] })

// Send each upload function to the respective input actor
const sendUploadFunctionToActors = pure(({ inputActors }, { uploadFunctions }) => R.addIndex(R.map)(
  (inputActor, index) => send({
    type: 'SET_UPLOAD_FUNCTION',
    uploadFunction: uploadFunctions[index]
  }, { to: inputActor }),
  inputActors
))

// Set the cancel function for the secondary run
const setCancelFunction = assign({
  cancelFunction: (_, { cancelFunction }) => cancelFunction
})

// Set the input's upload status according to the respective input actor's state
const setInputReady = pure(
  (_, event) => 'state' in event ? assign({
    inputsReady: ({ inputsReady }, { state: { context: { inputIndex }, matches } }) => {
      return R.update(
        inputIndex,
        matches('inputReady') ? 'success' :
        matches('inputFailed') ? 'failed' :
        matches('inputProcessing') ? 'loading' :
        'pending',
        inputsReady
      )
    }
  }) : undefined
)

// Set the logs for the secondary run
const setLogs = assign({
  logs: (_, { logs }) => logs
})

// Set the WES ID of the secondary run that has just been submitted
// (NOTE: this is different from the 'setSubmittedSecondaryRunWesID' action)
const setSecondaryRunWesID = assign({
  secondaryRunWesID: (_, { data: { data } }) => R.ifElse(
    RA.isNotNil,
    R.compose(
      R.prop('wesID'),
      R.head,
      R.values
    ),
    RA.stubNull
  )(data)
})

// Set the WES ID and set all inputsReady array values to 'success' for a secondary run that has already been submitted
const setSubmittedSecondaryRunWesID = assign({
  inputsReady: ({ inputsReady }, _) => R.repeat('success', R.length(inputsReady)),
  secondaryRunWesID: (_, { secondaryRunWesID }) => secondaryRunWesID
})

// Set the upload function for the input actor
const setUploadFunction = assign({
  uploadFunction: (_, { uploadFunction }) => uploadFunction
})

export {
  annotationTypeInit,
  onComplete,
  onCompleteReset,
  sendInputToActor,
  sendUploadFunctionToActors,
  setCancelFunction,
  setInputReady,
  setLogs,
  setSecondaryRunWesID,
  setSubmittedSecondaryRunWesID,
  setUploadFunction
}