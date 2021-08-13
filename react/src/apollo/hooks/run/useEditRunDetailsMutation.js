import {useState, useEffect} from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { RUN_DETAILS, EDIT_RUN_DESCRIPTION, EDIT_RUN_NAME } from '../../queries/run'
import * as R from 'ramda'


// custom hook to edit run details
export default function useEditRunDetailsMutation({runID}) {
  const [run, setRun] = useState(null)
  const {data: dataDetails, refetch} = useQuery(RUN_DETAILS, {
    fetchPolicy: 'network-only',
    variables: {runID},
  })
  
  
  // using the useMutation hook to get a mutate function (editRunDescription) that we can call to execute the mutation
  const [editRunDescription, {loading: loadingDesc, data: dataDesc, error: errorDesc}] = useMutation(EDIT_RUN_DESCRIPTION, {
    variables: {runID},
  })
  useEffect(() => {
    if (dataDesc) {
      refetch()
    }
  }, [dataDesc])

  // using the useMutation hook to get a mutate function (editRunName) that we can call to execute the mutation
  const [editRunName, {loading: loadingName, data: dataName, error: errorName}] = useMutation(EDIT_RUN_NAME, {
    variables: {runID},
  })
  useEffect(() => {
    if (dataName) {
      refetch()
    }
  }, [dataName])

  useEffect(() => {
    if (dataDetails) {
      setRun(dataDetails.run)
    }
  }, [dataDetails])

  return {run, editRunDescription, editRunName, loading: R.or(loadingDesc, loadingName), dataDesc, dataName}
}