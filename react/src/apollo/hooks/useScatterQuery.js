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

export default function useScatter(vis, group, runID, datasetID) {
  const [scatter, setScatter] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query Scatter($vis: String, $group: String, $runID: ID, $datasetID: ID) {
      scatter(vis: $vis, group: $group, runID: $runID, datasetID: $datasetID) {
        name
        type
        mode
        text
        x
        y
        marker {
            color
        }
      }
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {vis, group, runID, datasetID},
    onCompleted: ({scatter}) => {
      R.compose(
        setScatter,
        R.map(R.evolve({mode: R.join('+')})),
      )(scatter)
    },
    skip: R.isNil(group)
  })

  return scatter
}

