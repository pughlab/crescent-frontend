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

// FEATURES DATA NEEDS TO BE ORDERED!!!!!!

export default function useSearchFeatures(query, runID) {
  const [search, setSearch] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query search($query: String, $runID: ID) {
      search(query: $query, runID: $runID) {
        text
        value
      }
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {query, runID},
    onCompleted: ({search}) => {
      setSearch(search)
    }
  })

  return search
}

