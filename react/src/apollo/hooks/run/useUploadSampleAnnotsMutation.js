import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

export default function useUploadSampleAnnotsMutation(runID) {
  const [uploadSampleAnnots] = useMutation(gql`
    mutation UploadSampleAnnots(
      $runID: ID!
      $sampleAnnots: Upload!
    ) {
      uploadSampleAnnots(
        runID: $runID
        sampleAnnots: $sampleAnnots
      ) {
        runID
      }
    }
  `, {
    variables: {
      runID
    }
  })

  return uploadSampleAnnots
}