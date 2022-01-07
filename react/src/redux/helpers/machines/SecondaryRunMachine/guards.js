import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

// Checks if all the inputs are uploaded and valid
const isAllInputsReady = ({ inputsReady }, _) => R.all(R.equals('success'), inputsReady)

// Checks if the secondary run cancelation was successful
const isCancelSuccess = (_, { data: { data: { cancelSecondaryRun } } }) => R.equals('failed', cancelSecondaryRun)

// Checks if the uploaded input is valid
const isInputValid = ({ inputCondition }, { data: { data } }) => inputCondition(data)

// Checks if the secondary run is non-submittable
const isNonSubmittable = ({ submittable }, _) => !submittable

// Checks if the secondary run submission was successful
const isSubmitSuccess = ({ secondaryRunWesID }, _) => RA.isNotNil(secondaryRunWesID)

export {
  isAllInputsReady,
  isCancelSuccess,
  isInputValid,
  isNonSubmittable,
  isSubmitSuccess
}