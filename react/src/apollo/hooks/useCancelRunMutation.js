import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { createUploadLink } from 'apollo-upload-client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

export default function useCancelRunMutation(runID) {
  const [runStatus, setRunStatus] = useState(null)

  const { loading, data, error } = useQuery(gql`
    query RunStatus($runID: ID) {
      run(runID: $runID) {
        status
      }
    }
  `, {
    variables: {
      runID
    },
    onCompleted: ({ run: { status } }) => {
      setRunStatus(status)
    }
  })

  const [cancelRun, { loading: loadingCancelRun }] = useMutation(gql`
    mutation cancelRun($runID: ID) {
      cancelRun(runID: $runID)
    }
  `, {
    variables: { runID },
    onCompleted: () => {
      setRunStatus('canceled')
    }
  })


  return { cancelRun, runStatus, loadingCancelRun }
}