import {useState, useEffect} from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as RA from 'ramda-adjunct'
import * as R from 'ramda'
import { ADD_CUSTOM_TAG_DATASET, DATASET_DETAILS_CUSTOM_TAG } from '../../queries/dataset'

export default function useAddCustomTagDatasetMutation(datasetID, customTag) {
  const [dataset, setDataset] = useState(null)
  const {loading, data, error, refetch: refetchDatasetDetails} = useQuery(DATASET_DETAILS_CUSTOM_TAG, {
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
  const [addCustomTagDataset] = useMutation(ADD_CUSTOM_TAG_DATASET, {
    variables: {
      datasetID
    },
    onCompleted: ({addCustomTagDataset: dataset}) => {
      if (RA.isNotNil(dataset)) {
        setDataset(dataset)
      }
      refetchDatasetDetails()
    }
  })

  return {addCustomTagDataset, dataset}
}