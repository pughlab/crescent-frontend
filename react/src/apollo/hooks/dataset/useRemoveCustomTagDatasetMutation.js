import {useState, useEffect} from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as RA from 'ramda-adjunct'
import * as R from 'ramda'

export default function useRemoveCustomTagDatasetMutation(datasetID, customTag) {
  const [dataset, setDataset] = useState(null)
  const {loading, data, error, refetch: refetchDatasetDetails} = useQuery(gql`
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
    }
  })
  const [removeCustomTagDataset] = useMutation(gql`
    mutation RemoveCustomTagDataset(
      $datasetID: ID!
      $customTag: String
    ) {
      removeCustomTagDataset(
        datasetID: $datasetID
        customTag: $customTag
      ) {
        datasetID
        customTags
      }
    }
  `, {
    variables: {
      datasetID
    },
    onCompleted: ({removeCustomTagDataset: dataset}) => {
      if (RA.isNotNil(dataset)) {
        setDataset(dataset)
      }
      refetchDatasetDetails()
    }
  })

  return {removeCustomTagDataset, dataset}
}