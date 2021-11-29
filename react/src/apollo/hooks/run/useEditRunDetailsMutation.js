import {useState, useEffect} from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'

// custom hook to edit run details
export default function useEditRunDetailsMutation({runID}) {
  const [run, setRun] = useState(null)
  const {data: dataDetails, refetch} = useQuery(gql`
  query RunDetails($runID: ID) {
    run(runID: $runID) {
      runID
      createdOn
      createdBy {
        userID
        name
      }
      name
      description
      # params

      parameters

      secondaryRuns {
        wesID
        status
        submittedOn
        completedOn
      }
      uploadNames {
        gsva
        metadata
      }

      submittedOn
      completedOn

      datasets {
        datasetID
        name
        size
        hasMetadata
        cancerTag
        numCells
      }

      project {
        name
        createdBy {
          userID
          name
        }
      }
    }
  }
  `, {
    fetchPolicy: 'network-only',
    variables: {runID},
  })
  
  
  // using the useMutation hook to get a mutate function (editRunDescription) that we can call to execute the mutation
  const [editRunDescription, {loading: loadingDesc, data: dataDesc, error: errorDesc}] = useMutation(gql`
    mutation UpdateRunDescription($runID: ID!, $newDescription: String!) {
      updateRunDescription(runID: $runID, newDescription: $newDescription) {
        description
      }
    }
  `, {
    variables: {runID},
  })
  useEffect(() => {
    if (dataDesc) {
      refetch()
    }
  }, [dataDesc])

  // using the useMutation hook to get a mutate function (editRunName) that we can call to execute the mutation
  const [editRunName, {loading: loadingName, data: dataName, error: errorName}] = useMutation(gql`
  mutation UpdateRunName($runID: ID!, $newName: String!) {
    updateRunName(runID: $runID, newName: $newName) {
      name
    }
  }
  `, {
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