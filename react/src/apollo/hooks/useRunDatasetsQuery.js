import {useState, useEffect} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as RA from 'ramda-adjunct'
import * as R from 'ramda'

export default function useRunDatasetsQuery(runID) {
  const [run, setRun] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query RunDatasets($runID: ID) {
      run(runID: $runID) {

        parameters

        datasets {
          datasetID
          name
          size
          hasMetadata
        }
      }
    }
  `, {
    fetchPolicy: 'cache-and-network',
    variables: {runID},
    onCompleted: ({run}) => {
      setRun(run)
    }
  })

  return run
}

// Hook for providing dropdown selection options
// runID => [...{key, text, value}]
export function useRunDatasetsDropdownQuery(runID, {onNonEmptyOptions}) {
  const [options, setOptions] = useState(null)
  const run = useRunDatasetsQuery(runID)
  useEffect(() => {
    if (RA.isNotNil(run)) {
      R.compose(
        setOptions,
        R.map(({datasetID, name}) => ({key: datasetID, value: datasetID, text: name})),
        R.prop('datasets')
      )(run)
    }
  }, [run])

  useEffect(() => {
    if (R.not(RA.isNilOrEmpty(options))) {
      onNonEmptyOptions(options)
    }
  }, options)
  return options
}
