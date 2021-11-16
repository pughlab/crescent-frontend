import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as RA from 'ramda-adjunct'

export default function useCancelRunMutation(runID) {
  const [cancellable, setCancellable] = useState(false)
  const [cancelFailed, setCancelFailed] = useState(null)

  const { data } = useQuery(gql`
    query RunLogs($runID: ID) {
      run(runID: $runID) {
        logs
      }
    }
  `, {
    variables: {
      runID
    },
    pollInterval: 1000
  })
  
  useEffect(() => {
    if (RA.isNotNil(data)) {
      const {run: {logs}} = data
      setCancellable(RA.isNotNil(logs)) // if logs is not null then set cancellable to true
    }
  }, [data])

  const [cancelRun, { loading: loadingCancelRun }] = useMutation(gql`
    mutation cancelRun($runID: ID) {
      cancelRun(runID: $runID)
    }
  `, {
    variables: { runID },
    onCompleted: ({cancelRun}) => {
      setCancelFailed(cancelRun === 'failed' ? null : 'failed')
    }
  })


  return { cancelRun, loadingCancelRun, cancelFailed, cancellable }
}