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


export default function useCellCounts(runID) {
  const [cellcount, setCellCounts] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query CellCounts($runID: ID) {
      cellcount(runID: $runID)
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {runID},
    onCompleted: ({cellcount}) => {
      setCellCounts(cellcount)
    },
    skip: R.isNil(runID)

  })
  // useEffect(() => {
  //   if (error) {
      
  //   }
  // }, [error])

  return cellcount
}

