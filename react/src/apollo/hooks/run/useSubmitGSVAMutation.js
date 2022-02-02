import {useState, useEffect} from 'react'
import {useQuery, useMutation} from '@apollo/react-hooks'
import {gql} from 'apollo-boost'
import {grapheneClient as client} from '../../clients'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import {useSecondaryRunEvents} from '../../../xstate/hooks'

export default function useSubmitGSVAMutation(runID) {
  const [run, setRun] = useState(null)
  const {updateStatus} = useSecondaryRunEvents()

  const {data, refetch: refetchRunStatus} = useQuery(gql`
    query RunStatus($runID: ID) {
      run(runID: $runID) {
        secondaryRuns {
          wesID
          type
          status
          submittedOn
          completedOn
        }
      }
    }
  `, {
    variables: {
      runID
    },
    fetchPolicy: 'network-only'
  })

  useEffect(() => {
    if (data) setRun(data.run)
  }, [data])

  useEffect(() => {
    // Filter out all non-GSVA secondary runs
    const secondaryRunsByAnnotationType = R.ifElse(
      RA.isNotNil,
      R.compose(
        R.filter(R.propEq('type', 'GSVA')),
        R.prop('secondaryRuns'),
      ),
      RA.stubArray
    )(run)

    // Get the status and wesID of the most recent GSVA secondary run
    // (or null for both if none exists)
    const [latestSecondaryRunStatus, latestSecondaryRunWesID] = R.compose(
      R.ifElse(
        RA.isNotUndefined, 
        R.props(['status', 'wesID']),
        R.always(R.repeat(null, 2))
      ),
      R.last
    )(secondaryRunsByAnnotationType)

    if (R.equals('submitted', latestSecondaryRunStatus)) {
      updateStatus({
        secondaryRunWesID: latestSecondaryRunWesID,
        status: 'submitted'
      })
    }
  }, [run, updateStatus])

  const [submitGsva, {data: gsvaData}] = useMutation(gql`
    mutation SubmitGSVA($runID: ID) {
      submitGsva(runId: $runID) {
        wesID
      }
    }
  `, {
    client,
    variables: {
      runID
    }
  })

  useEffect(() => {
    if (gsvaData) refetchRunStatus()
  }, [gsvaData, refetchRunStatus])

  return {submitGsva, run}
}