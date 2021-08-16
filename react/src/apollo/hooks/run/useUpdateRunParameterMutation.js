import {useState, useEffect} from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { RUN_PARAMETERS_UPDATE, UPDATE_RUN_PARAMETER_VALUE } from '../../queries/run'
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
  const {loading: loadingQuery, data, error, refetch} = useQuery(RUN_PARAMETERS_UPDATE, {
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
  const [updateRunParameterValue, {loading: loadingMutation}] = useMutation(UPDATE_RUN_PARAMETER_VALUE, {
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