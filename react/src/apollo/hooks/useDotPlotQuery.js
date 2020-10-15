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

export default function useDotPlots(runID) {
  const [dotPlots, setDotPlots] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query DotPlots($runID: ID) {
      dotPlots(runID: $runID) {
        type
        mode
        x
        y
        marker {
            color
            symbol
            size
            opacity
        }
      }
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {runID},
    onCompleted: ({dotPlots}) => {
      R.compose(
        setDotPlots,
        R.map(R.evolve({mode: R.join('+')})),
      )(dotPlots)
    },
    // skip: R.isNil(group)
  })

  return dotPlots
}

