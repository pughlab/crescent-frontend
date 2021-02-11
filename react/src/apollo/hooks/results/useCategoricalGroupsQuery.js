import {useState} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import {grapheneClient as client} from '../../clients'


export default function useCategoricalGroups(runID, datasetID) {
  const [categoricalGroups, setCategoricalGroups] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query CategoricalGroups($runID: ID, $datasetID: ID) {
      categoricalGroups(runID: $runID, datasetID: $datasetID)
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {runID, datasetID},
    onCompleted: ({categoricalGroups}) => {
      setCategoricalGroups(categoricalGroups)
    }
  })

  return categoricalGroups
}

