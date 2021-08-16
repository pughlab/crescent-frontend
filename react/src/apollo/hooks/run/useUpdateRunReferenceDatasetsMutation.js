import {useState, useEffect} from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { RUN_REFERENCE_DATASETS, UPDATE_RUN_REFERENCE_DATASETS } from '../../queries/run'
import * as RA from 'ramda-adjunct'
import * as R from 'ramda'

import useRunDetailsQuery from './useRunDetailsQuery'

export default function useUpdateRunReferenceDatasetsMutation ({
  runID
}) {
  const [run, setRun] = useState(null)
  const {data: dataDatasets, refetch} = useQuery(RUN_REFERENCE_DATASETS, {
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

  const [updateRunReferenceDatasets, {loading, data, error}] = useMutation(UPDATE_RUN_REFERENCE_DATASETS, {
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