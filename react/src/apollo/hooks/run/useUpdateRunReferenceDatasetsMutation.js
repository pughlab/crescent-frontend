import {useState, useEffect} from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as RA from 'ramda-adjunct'
import * as R from 'ramda'

import useRunDetailsQuery from './useRunDetailsQuery'

export default function useUpdateRunReferenceDatasetsMutation ({
  runID
}) {
  const [run, setRun] = useState(null)
  useQuery(gql`
    query RunDatasets($runID: ID) {
      run(runID: $runID) {
        status
        datasets {
          datasetID
          name
          size
          hasMetadata
        }
        referenceDatasets {
          datasetID
        }
      }
    }
  `, {
    variables: {runID},
    onCompleted: ({run}) => {if (RA.isNotNil(run)) {setRun(run)}}
  })

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

  return {run, updateRunReferenceDatasets, loading}
}