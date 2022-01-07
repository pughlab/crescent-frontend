import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

export default function useUploadRunGenesetMutation(runID) {
  const [uploadRunGeneset] = useMutation(gql`
    mutation UploadRunGeneset(
      $runID: ID!
      $geneset: Upload!
    ) {
      uploadRunGeneset(
        runID: $runID
        geneset: $geneset
      ) {
        runID
      }
    }
  `, {
    variables: {
      runID
    }
  })

  return uploadRunGeneset
}