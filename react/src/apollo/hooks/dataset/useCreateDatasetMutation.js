import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

const useCreateDatasetMutation = () => {
  const [createDataset] = useMutation(gql`
    mutation CreateDataset(
      $name: String!
      $matrix: Upload!
      $features: Upload!
      $barcodes: Upload!
    ) {
      createDataset(
        name: $name
        matrix: $matrix
        features: $features
        barcodes: $barcodes
      ) {
        datasetID
      }
    }
  `)

  return createDataset
}

export default useCreateDatasetMutation