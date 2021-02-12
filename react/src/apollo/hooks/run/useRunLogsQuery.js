import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { createUploadLink } from 'apollo-upload-client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import { applyIfFunction } from 'ramda-extension'

export default function useRunLogsQuery(runID) {
  const [logs, setLogs] = useState(null)

  const { loading, data, error } = useQuery(gql`
    query RunLogs($runID: ID) {
      run(runID: $runID) {
        logs
      }
    }
  `, {
    variables: {
      runID
    },
    // onCompleted: ({ run: { logs } }) => {
      
    // },
    pollInterval: 500
  })

  useEffect(() => {
    if (RA.isNotNil(data)) {
      const {run: {logs: logsFromPolling}} = data
      setLogs(logsFromPolling)
    }
  }, [data])

  return {logs, loading}
}