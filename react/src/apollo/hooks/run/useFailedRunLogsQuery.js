import { useState, useEffect } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as RA from 'ramda-adjunct'

const useFailedRunLogsQuery = runID => {
  const [failedRunLogs, setFailedRunLogs] = useState(null)

  // completedOn is also being polled because the failed run logs file is only uploaded to MinIO when completedOn is resolved
  const { data, stopPolling: stopFailedRunLogsPolling } = useQuery(gql`
    query FailedRunLogs($runID: ID) {
      run(runID: $runID) {
        completedOn
        failedRunLogs
      }
    }
  `, {
    variables: { runID },
    pollInterval: 500
  })

  useEffect(() => {
    if (RA.isNotNil(data)) {
      const {run: {failedRunLogs: failedRunLogsFromPolling}} = data

      setFailedRunLogs(failedRunLogsFromPolling)
    }
  }, [data])

  return { failedRunLogs, stopFailedRunLogsPolling }
}

export default useFailedRunLogsQuery