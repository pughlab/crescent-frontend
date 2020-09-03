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

export default function useQCScatter(qcType, runID, datasetID) {
  const [qcScatter, setQCScatter] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query QCScatter($qcType: String, $runID: ID, $datasetID: ID) {
      qcScatter(qcType: $qcType, runID: $runID, datasetID: $datasetID) {
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
    variables: {qcType, runID, datasetID},
    onCompleted: ({qcScatter}) => {
      R.compose(
        setQCScatter,
        R.evolve({
          mode: R.join('+')
        })
      )(qcScatter)
    }
  })

  return qcScatter
}

