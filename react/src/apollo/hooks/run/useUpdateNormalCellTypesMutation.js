import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

export default function useUpdateNormalCellTypesMutation(runID) {
  const [updateNormalCellTypes] = useMutation(gql`
    mutation UpdateNormalCellTypes(
      $runID: ID!
      $normalCellTypes: [String]
    ) {
      updateNormalCellTypes(
        runID: $runID
        normalCellTypes: $normalCellTypes
      ) {
        runID
        normalCellTypes
      }
    }
  `, {
    variables: {
      runID
    }
  })

  return updateNormalCellTypes
}