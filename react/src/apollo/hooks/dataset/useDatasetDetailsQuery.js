import {useState, useEffect} from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as RA from 'ramda-adjunct'
import * as R from 'ramda'

export default function useDatasetDetails(datasetID) {
  const [dataset, setDataset] = useState(null)
  const {loading, data, error, refetch} = useQuery(gql`
    query DatasetDetails (
      $datasetID: ID!
    ) {
      dataset(
        datasetID: $datasetID
      ) {
        datasetID
        name
        hasMetadata
        size
        cancerTag
        oncotreeCode
        customTags
        numCells
      }
    }
  `, {
    fetchPolicy: 'network-only',
    variables: {
      datasetID
    },
    onCompleted: ({dataset}) => {
      if (RA.isNotNil(dataset)) {
        setDataset(dataset)
      }
      refetch()
    }
  })

  return dataset
}
