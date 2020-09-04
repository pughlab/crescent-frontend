import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import {createUploadLink} from 'apollo-upload-client'


import {useState} from 'react'
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


// export default function useGraphene() {
//   const {loading, data, error} = useQuery(gql`
//     query {
//       test {
//         testField
//       }
//     }
//   `, {
//     client,
//   })
//   console.log(data)
//   return 
// }

export default function useResultsAvailable(runID) {
  const [plots, setPlots] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query ResultsAvailable($runID: ID) {
      plots(runID: $runID) {
        label
        result
        description
      }
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {runID},
    onCompleted: ({plots}) => {
      setPlots(plots)
    },
    skip: R.isNil(runID)
  })

  return plots
}