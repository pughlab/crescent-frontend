import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as RA from 'ramda-adjunct'
import { useNewProjectEvents } from '../../../xstate/hooks'

const useDeleteDatasetMutation = datasetID => {
  const { removeUploadedDataset } = useNewProjectEvents()

  const [deleteDataset] = useMutation(gql`
    mutation DeleteDataset(
      $datasetID: ID!
    ) {
      deleteDataset(
        datasetID: $datasetID
      ) {
        datasetID
      }
    }
  `, {
    variables: { datasetID },
    onCompleted: ({ deleteDataset }) => {
      if (RA.isNotNil(deleteDataset)) {
        const { datasetID } = deleteDataset

        removeUploadedDataset({ datasetID })
      }
    }
  })

  return deleteDataset
}

export default useDeleteDatasetMutation