import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

export default function useUploadRunMetadataMutation(runID) {
  const [uploadRunMetadata] = useMutation(gql`
    mutation UploadRunMetadata(
      $runID: ID!
      $metadata: Upload!
    ) {
      uploadRunMetadata(
        runID: $runID
        metadata: $metadata
      ) {
        runID
      }
    }
  `, {
    variables: {
      runID
    }
  })

  return uploadRunMetadata
}