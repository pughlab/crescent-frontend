import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { createUploadLink } from 'apollo-upload-client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { RUN_STATUS, CANCEL_RUN } from '../../queries/run'

import * as RA from 'ramda-adjunct'

export default function useCancelRunMutation(runID) {
  const [cancellable, setCancellable] = useState(false)
  const [runStatus, setRunStatus] = useState(null)
  const [cancelFailed, setCancelFailed] = useState(null)

  const { loading, data, error } = useQuery(RUN_STATUS, {
    variables: {
      runID
    },
    pollInterval: 1000,
  })
  
  useEffect(() => {
    if (RA.isNotNil(data)) {
      const {run: {status, logs}} = data
      setRunStatus(status)
      setCancellable(RA.isNotNil(logs)) // if logs is not null then set cancellable to true
    }
  }, [data])

  const [cancelRun, { loading: loadingCancelRun }] = useMutation(CANCEL_RUN, {
    variables: { runID },
    onCompleted: ({cancelRun}) => {
      if (cancelRun == "failed"){
        setRunStatus('canceled')
        setCancelFailed(null)
      }
      else {
        setCancelFailed('failed')
      }
    }
  })


  return { cancelRun, runStatus, loadingCancelRun, cancelFailed, cancellable }
}