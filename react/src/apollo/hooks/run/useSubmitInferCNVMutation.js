import {useState, useEffect} from 'react'
import {useActor} from '@xstate/react'
import {useQuery, useMutation} from '@apollo/react-hooks'
import {gql} from 'apollo-boost'
import {grapheneClient as client} from '../../clients'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import {useAnnotations} from '../../../redux/hooks'

export default function useSubmitInferCNVMutation(runID) {
  const {annotationsService: service} = useAnnotations()
  const [run, setRun] = useState(null)

  const [, send] = useActor(service)

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
    // Filter out all non-InferCNV secondary runs
    const secondaryRunsByAnnotationType = R.ifElse(
      RA.isNotNil,
      R.compose(
        R.filter(R.propEq('type', 'InferCNV')),
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

    send({
      type: 'SET_SECONDARY_RUN_WES_ID',
      secondaryRunWesID: R.equals('submitted', latestSecondaryRunStatus) ? latestSecondaryRunWesID : null
    })
  }, [run, send])

  const [submitInferCNV, {data: infercnvData}] = useMutation(gql`
    mutation SubmitInferCNV($runID: ID) {
      submitInfercnv(runId: $runID) {
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
    if (infercnvData) refetchRunStatus()
  }, [infercnvData, refetchRunStatus])

  return {submitInferCNV, run}
}