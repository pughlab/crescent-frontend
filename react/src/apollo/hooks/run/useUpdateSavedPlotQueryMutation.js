import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { cleanUpPlotQuery } from '../../../utils'
export default function useUpdateSavedPlotQueryMutation({
  runID,
  input,
  onComplete
}
) {
  const [updateSavedPlotQuery, {loading, error}] = useMutation(gql`
    mutation UpdateSavedPlotQuery(
      $runID: ID!,
      $input: PlotQueryInput!
    ) {
      updateSavedPlotQuery(
        runID: $runID,
        input: $input
      ) {
          id
          activeResult
          selectedQC
          selectedFeature
          selectedFeatures
          selectedScaleBy
          selectedExpRange
          selectedGroup
          selectedAssay
          selectedDiffExpression
          selectedQCDataset
      }
    }
  `, {
    variables: {
      runID, input
    },
    onCompleted: ({updateSavedPlotQuery: plotQuery}) => {
      // update the plot in multiplot page
      onComplete(cleanUpPlotQuery({...plotQuery, runID}))
    }
  })
  return {updateSavedPlotQuery, loading}
}