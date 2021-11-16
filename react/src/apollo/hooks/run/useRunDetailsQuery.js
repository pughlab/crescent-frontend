import {useState, useEffect} from 'react'
import {useLazyQuery, useQuery} from '@apollo/react-hooks'
import {gql} from 'apollo-boost'
import * as RA from 'ramda-adjunct'

export default function useRunDetails(runID) {
  const [run, setRun] = useState(null)
  const [runStatus, setRunStatus] = useState(null)

  const [getRunStatus, {data: statusData, startPolling: startStatusPolling, stopPolling: stopStatusPolling}] = useLazyQuery(gql`
    query RunStatus($runID: ID!) {
      run(runID: $runID) {
        status
      }
    }
  `, {
    fetchPolicy: 'cache-and-network',
    variables: {runID}
  })

  useEffect(() => {
    if (RA.isNotNil(statusData)) {
      const {run: {status}} = statusData
      setRunStatus(status)
    }
  }, [statusData])

  useQuery(gql`
    query RunDetails($runID: ID) {
      run(runID: $runID) {
        runID
        createdOn
        createdBy {
          userID
          name
        }
        name
        description
        # params

        parameters

        savedPlotQueries {
          id
          activeResult
          selectedQC
          selectedFeature
          selectedFeatures
          selectedGroup
          selectedAssay
          selectedDiffExpression
          selectedQCDataset
          selectedScaleBy
          selectedExpRange
        }

        secondaryRuns {
          wesID
          status
          submittedOn
          completedOn
        }
        uploadNames {
          gsva
          metadata
        }

        submittedOn
        completedOn

        datasets {
          datasetID
          name
          size
          hasMetadata
          cancerTag
        }

        project {
          projectID
          name
          createdBy {
            userID
            name
          }
        }
      }
    }
  `, {
    fetchPolicy: 'cache-and-network',
    variables: {runID},
    onCompleted: ({run}) => {
      setRun(run)
    }
  })

  return {getRunStatus, run, runStatus, startStatusPolling, stopStatusPolling}
}
