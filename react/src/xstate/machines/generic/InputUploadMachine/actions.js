import { assign } from 'xstate'
import * as RA from 'ramda-adjunct'

// Reset the result of the previous input upload
const resetUploadResults = assign({
  uploadResults: RA.stubNull
})

// Set the upload function for the input actor
const setUploadFunction = assign({
  uploadFunction: (_, { uploadFunction }) => uploadFunction
})

// Set the upload results for the input actor
const setUploadResults = assign({
  uploadResults: (_, { data }) => data
})

export {
  resetUploadResults,
  setUploadFunction,
  setUploadResults
}