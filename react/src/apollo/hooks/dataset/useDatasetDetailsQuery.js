import {useState, useEffect} from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as RA from 'ramda-adjunct'
import * as R from 'ramda'
import { DATASET_DETAILS_QUERY } from '../../queries/dataset'

export default function useDatasetDetails(datasetID) {
  const [dataset, setDataset] = useState(null)
  const {loading, data, error, refetch} = useQuery(DATASET_DETAILS_QUERY, {
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
