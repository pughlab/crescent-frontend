import {useState, useEffect} from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as RA from 'ramda-adjunct'
import * as R from 'ramda'

export default function useUpdateRunParameterMutation({
  runID,
  step,
  parameter,
  datasetID
}) {
  const [parameterValue, setParameterValue] = useState(null)
  const parameterValuePath = R.path([
    'parameters',
    step,
    // In case of step being quality control then datasetID is nonnull
    ... R.isNil(datasetID) ? [parameter] : [datasetID, parameter]
  ])
  const {loading: loadingQuery, data, error, refetch} = useQuery(gql`
    query RunParameters($runID: ID) {
      run(runID: $runID) {
        runID
        parameters
      }
    }
  `, {
    fetchPolicy: 'network-only',
    variables: {runID},
  })
  useEffect(() => {
    if (RA.isNotNil(data)) {
      const {run} = data
      R.compose(
        setParameterValue,
        parameterValuePath
      )(run)
    }
  }, [data])
  const [updateRunParameterValue, {loading: loadingMutation}] = useMutation(gql`
    mutation UpdateRunParameterValue(
      $runID: ID!
      $step: String!
      $parameter: String!
      $value: ToolParameterValue!
    ) {
      updateRunParameterValue(
        runID: $runID,
        step: $step,
        parameter: $parameter,
        value: $value,
      ) {
        runID
        parameters
      }
    }
  `, {
    variables: {
      runID, step, parameter
    },
    onCompleted: ({updateRunParameterValue: run}) => {
      if (RA.isNotNil(run)) {
        console.log('mutation', run)
        R.compose(
          setParameterValue,
          parameterValuePath
        )(run)
      }
    }
  })

  const isLoading = R.or(loadingQuery, loadingMutation)
  console.log(parameterValue)

  return {parameterValue, updateRunParameterValue, isLoading}
}