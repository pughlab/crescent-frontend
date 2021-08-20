import {useState, useEffect} from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as RA from 'ramda-adjunct'
import * as R from 'ramda'
import { DATASET_DETAILS_QUERY, TAG_DATASET } from '../../queries/dataset'

export default function useTagDatasetMutation(datasetID) {
  const [dataset, setDataset] = useState(null)
  const {loading, data, error} = useQuery(DATASET_DETAILS_QUERY, {
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
  const [tagDataset] = useMutation(TAG_DATASET, {
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