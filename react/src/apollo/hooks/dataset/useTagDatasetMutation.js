import {useState, useEffect} from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as RA from 'ramda-adjunct'
import * as R from 'ramda'

export default function useTagDatasetMutation(datasetID) {
  const [dataset, setDataset] = useState(null)
  const {loading, data, error} = useQuery(gql`
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
        numGenes
        numCells
        cancerTag
        oncotreeCode
        customTags
      }
    }
  `, {
    fetchPolicy: 'cache-and-network',
    variables: {
      datasetID
    },
    onCompleted: ({dataset}) => {
      if (RA.isNotNil(dataset)) {
        setDataset(dataset)
      }
    }
  })
  const [tagDataset] = useMutation(gql`
    mutation TagDataset(
      $datasetID: ID!
      $cancerTag: Boolean
      $oncotreeCode: String
    ) {
      tagDataset(
        datasetID: $datasetID
        cancerTag: $cancerTag
        oncotreeCode: $oncotreeCode
      ) {
        datasetID
        name
        hasMetadata
        size
        numGenes
        numCells
        cancerTag
        oncotreeCode
        customTags
      }
    }
  `, {
    variables: {
      datasetID
    },
    onCompleted: ({tagDataset: dataset}) => {
      if (RA.isNotNil(dataset)) {
        setDataset(dataset)
      }
    }
  })

  return {tagDataset, dataset}
}