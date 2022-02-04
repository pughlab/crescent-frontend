import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

// Check to see if all the inputs are ready:
// - The project name and description have been provided (i.e. neither are empty)
// - At least one dataset has been uploaded or at least one existing project has been selected for integration
const isAllInputsReady = ({ mergedProjectIDs, projectDescription, projectName, uploadedDatasetIDs }, _) => R.and(
  R.all(RA.isNonEmptyString, [projectName, projectDescription]),
  R.either(RA.isNonEmptyArray, [mergedProjectIDs, uploadedDatasetIDs]),
)

export {
  isAllInputsReady
}