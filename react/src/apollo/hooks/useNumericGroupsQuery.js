import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import {createUploadLink} from 'apollo-upload-client'


import {useState} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

require('dotenv').config()
console.log(process.env.REACT_APP_GRAPHENE_URL_DEV)

const link = createUploadLink({uri: process.env.NODE_ENV === 'development'
? process.env.REACT_APP_GRAPHENE_URL_DEV
// TODO :prod url
: process.env.REACT_APP_GRAPHENE_URL_DEV})

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link
})


export default function useNumericGroups(runID, datasetID) {
  const [numericGroups, setNumericGroups] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query NumericGroups($runID: ID, $datasetID: ID) {
      numericGroups(runID: $runID, datasetID: $datasetID)
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {runID, datasetID},
    onCompleted: ({numericGroups}) => {
      setNumericGroups(numericGroups)
    }
  })

  return numericGroups
}

