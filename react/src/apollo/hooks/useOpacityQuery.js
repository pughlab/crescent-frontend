import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import {createUploadLink} from 'apollo-upload-client'


import {useState, useEffect} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'


require('dotenv').config()
console.log(process.env.REACT_APP_GRAPHENE_URL_DEV)

const link = createUploadLink({uri: process.env.NODE_ENV === 'development'
? process.env.REACT_APP_GRAPHENE_URL_DEV
// TODO :prod url
: process.env.REACT_APP_GRAPHENE_URL_PROD})

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link
})

export default function useOpacity(vis, feature, group, runID, datasetID, expRange) {
  const [opacity, setOpacity] = useState(null)
  const {loading, data, error, refetch} = useQuery(gql`
    query Opacity($vis: String, $feature: String, $group: String, $runID: ID, $datasetID: ID, $expRange: [Float]) {
      opacity(vis: $vis, feature: $feature, group: $group, runID: $runID, datasetID: $datasetID, expRange: $expRange) {
        name
        type
        mode
        text
        x
        y
        marker {
            opacity
            color
        }
        hovertemplate
        globalmax
      }
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {vis, feature, group, runID, datasetID, expRange},
    onCompleted: ({opacity}) => {
      R.compose(
        setOpacity,
        R.map(R.evolve({mode: R.join('+')})),
        // R.prop('data')
      )(opacity)
    },
    skip: R.isNil(feature, group)
  })

  useEffect(() => {
    if (error) {
      refetch()
    }
  }, [error])

  return opacity
}

