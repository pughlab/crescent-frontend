import { assign } from 'xstate'

// Set the upload function for the input actor
const setUploadFunction = assign({
  uploadFunction: (_, { uploadFunction }) => uploadFunction
})

export { setUploadFunction }