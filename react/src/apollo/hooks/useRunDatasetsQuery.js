import {useState} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

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
