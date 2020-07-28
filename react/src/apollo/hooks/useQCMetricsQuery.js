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

export default function useQCMetrics({runID, datasetID}) {
  const [qcMetrics, setQCMetrics] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query QCMetrics($runID: ID, $datasetID: ID) {
      qcMetrics(runID: $runID, datasetID: $datasetID) {
        cellcounts {
          Before
          After
        }
        qcSteps {
          filtertype
          min
          max
          numRemoved
        }
      }
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {runID, datasetID},
    onCompleted: ({qcMetrics}) => {
      setQCMetrics(qcMetrics)
    }
  })

  return qcMetrics
}

