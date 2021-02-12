import React, {useState, useEffect, useRef} from 'react';

import { Loader, Segment, Button, Transition, Divider, Step, Menu, Header, Accordion, Dropdown } from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useDispatch} from 'react-redux'
import {useCrescentContext} from '../../../../redux/hooks'
import {useSubmitRunMutation} from '../../../../apollo/hooks/run'

const SubmitRunButton = ({
}) => {
  const {userID, runID} = useCrescentContext()

  // const dispatch = useDispatch()
  // const {isSubmitted} = useResultsPage()

  // const run = useRunDetailsQuery(runID)
  const {submitRun, runStatus, loadingSubmitRun} = useSubmitRunMutation(runID)

  if (R.any(R.isNil, [runStatus])) {
    return null
  }

  // const {status: runStatus} = run
  // const {createdBy: creatorUserID} = run


  // const [submitRun, {loading: loadingSubmitRun, data: dataSubmitRun, error}] = useMutation(gql`
  //   mutation SubmitRun($runID: ID, $params: String) {
  //     submitRun(runID: $runID, params: $params) {
  //       runID
  //     }
  //   }
  // `, {
  //   variables: {runID, params: JSON.stringify(parameters)}
  // })

  const runIsPending = R.equals('pending', runStatus)
  // const runSubmitted = R.or(
  //   loadingSubmitRun,
  //   queryIsNotNil('submitRun', dataSubmitRun)
  // )
  // const currentUserIsNotCreator = R.not(R.equals(creatorUserID, userID))
  return (
    <Button fluid color='blue'
      content={runIsPending ? 'SUBMIT RUN' : 'SUBMITTED, REFRESH PAGE'}
      // Check redux state of submit button, the status in run in redux, or if graphql mutation has been called
      // disabled={R.any(RA.isTrue, [currentUserIsNotCreator, isSubmitted, runIsNotPending, runSubmitted])}
      disabled={R.any(RA.isTrue, [R.not(runIsPending), loadingSubmitRun])}
      onClick={() => {
        // setIsSubmitted(true)
        // dispatch(setIsSubmitted(true))
        submitRun()
      }}
    />
  )
}

export default SubmitRunButton
