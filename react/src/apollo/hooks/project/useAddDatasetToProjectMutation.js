import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

const useAddDatasetToProjectMutation = () => {
  const [addDatasetToProject, { error: addDatasetToProjectError, loading: addDatasetToProjectLoading }] = useMutation(gql`
    mutation AddDataset(
      $datasetIDs: [ID!]!
      $projectID: ID!
    ) {
      addDataset(
        datasetIDs: $datasetIDs
        projectID: $projectID
      ) {
        projectID
      }
    }
  `)

  return { addDatasetToProject, addDatasetToProjectError, addDatasetToProjectLoading }
}

export default useAddDatasetToProjectMutation