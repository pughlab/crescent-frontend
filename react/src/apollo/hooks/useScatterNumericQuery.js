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

export default function useScatterNumeric(vis, group, runID, datasetID) {
  const [scatter, setScatter] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query Scatter($vis: String, $group: String, $runID: ID, $datasetID: ID) {
      scatter(vis: $vis, group: $group, runID: $runID, datasetID: $datasetID) {
        mode
        text
        hovertext
        x
        y
        marker {
          color
          colorscale
          showscale
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
      // setScatterNumeric(scatterNumeric)
    },
    skip: R.isNil(group)
  })

  return scatter
}

