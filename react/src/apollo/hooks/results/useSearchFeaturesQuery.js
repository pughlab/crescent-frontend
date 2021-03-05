import {useState} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {grapheneClient as client} from '../../clients'
import * as R from 'ramda'


// FEATURES DATA NEEDS TO BE ORDERED!!!!!!

export default function useSearchFeatures(query, runID, assay) {
  const [search, setSearch] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query search($query: String, $runID: ID, $assay: String) {
      search(query: $query, runID: $runID, assay: $assay) {
        text
        value
      }
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {query, runID, assay},
    onCompleted: ({search}) => {
      setSearch(search)
    }
  })

  return search
}

