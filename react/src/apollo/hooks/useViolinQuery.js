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
: process.env.REACT_APP_GRAPHENE_URL_DEV})

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

export default function useViolin(feature, group, runID) {
  const [violin, setViolin] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query Violin($feature: String, $group: String, $runID: ID) {
      violin(feature: $feature, group: $group, runID: $runID) {
        data {
          type
          spanmode
          fillcolor
          line {
            color
          }
          points
          jitter
          width
          meanline {
            visible
          }
          x
          y
          bandwidth
        }
      }
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {feature, group, runID},
    onCompleted: ({violin}) => {
      setViolin(violin)
    }
  })

  return violin
}

