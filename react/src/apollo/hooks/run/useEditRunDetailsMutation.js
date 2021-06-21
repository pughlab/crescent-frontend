import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

// custom hook to edit run details
export default function useEditRunDetailsMutation({runID}) {
  
  // using the useMutation hook to get a mutate function (editRunDescription) that we can call to execute the mutation
  const [editRunDescription, {loading: loadingDesc, data: dataDesc, error: errorDesc}] = useMutation(gql`
    mutation UpdateRunDescription($runID: ID!, $newDescription: String!) {
      updateRunDescription(runID: $runID, newDescription: $newDescription) {
        description
      }
    }
  `, {
    variables: {runID}
  })

  // using the useMutation hook to get a mutate function (editRunName) that we can call to execute the mutation
  const [editRunName, {loading: loadingName, data: dataName, error: errorName}] = useMutation(gql`
  mutation UpdateRunName($runID: ID!, $newName: String!) {
    updateRunName(runID: $runID, newName: $newName) {
      name
    }
  }
  `, {
    variables: {runID}
  })

  return {editRunDescription, editRunName, loadingDesc, dataDesc, loadingName, dataName}
}