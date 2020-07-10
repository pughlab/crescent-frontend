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

export default function useOpacity(vis, feature, group, runID) {
  const [opacity, setOpacity] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query Opacity($vis: String, $feature: String, $group: String, $runID: ID) {
      opacity(vis: $vis, feature: $feature, group: $group, runID: $runID) {
        data {
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
        }
      }
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {vis, feature, group, runID},
    onCompleted: ({opacity}) => {
      R.compose(
        setOpacity,
        R.map(R.evolve({mode: R.join('+')})),
        R.prop('data')
      )(opacity)
    }
  })

  return opacity
}

