import {useState, useEffect} from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as RA from 'ramda-adjunct'
import * as R from 'ramda'
import { DATASET_DETAILS_QUERY, REMOVE_CUSTOM_TAG_DATASET } from '../../queries/dataset'

export default function useRemoveCustomTagDatasetMutation(datasetID, customTag) {
  const [dataset, setDataset] = useState(null)
  const {loading, data, error, refetch: refetchDatasetDetails} = useQuery(DATASET_DETAILS_QUERY, {
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
  const [removeCustomTagDataset] = useMutation(REMOVE_CUSTOM_TAG_DATASET, {
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