import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

export default function useUploadGenePosMutation(runID) {
  const [uploadGenePos] = useMutation(gql`
    mutation UploadGenePos(
      $runID: ID!
      $genePos: Upload!
    ) {
      uploadGenePos(
        runID: $runID
        genePos: $genePos
      ) {
        runID
      }
    }
  `, {
    variables: {
      runID
    }
  })

  return uploadGenePos
}