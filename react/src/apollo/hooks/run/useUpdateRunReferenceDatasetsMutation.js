import {useState, useEffect} from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as RA from 'ramda-adjunct'

export default function useUpdateRunReferenceDatasetsMutation ({
  runID
}) {
  const [run, setRun] = useState(null)
  const {data: dataDatasets, refetch} = useQuery(gql`
    query RunDatasets($runID: ID) {
      run(runID: $runID) {
        datasets {
          datasetID
          name
          size
          hasMetadata
          cancerTag
          numCells
        }
        referenceDatasets {
          datasetID
        }
      }
    }
  `, {
    variables: {runID},
    fetchPolicy: 'network-only',
    onCompleted: ({run}) => {
      if (RA.isNotNil(run)) {
        setRun(run) 
      }
    }
  })
  useEffect(() => {
    if (dataDatasets) {
      setRun(dataDatasets.run)
    }
  }, [dataDatasets])

  const [updateRunReferenceDatasets, {loading, data, error}] = useMutation(gql`
    mutation UpdateRunReferenceDatasets(
      $runID: ID!
      $datasetIDs: [ID]
    ) {
      updateRunReferenceDatasets(
        runID: $runID
        datasetIDs: $datasetIDs
      ) {
        status
        datasets {
          datasetID
          name
          size
          hasMetadata
          cancerTag
          numCells
        }
        referenceDatasets {
          datasetID
        }
      }
    }
  `, {
    variables: {runID},
    onCompleted: ({updateRunReferenceDatasets: run}) => {if (RA.isNotNil(run)) {setRun(run)}},
  })
  useEffect(() => {
    if (data) {
      refetch()
    }
  }, [data])

  return {run, updateRunReferenceDatasets, loading}
}