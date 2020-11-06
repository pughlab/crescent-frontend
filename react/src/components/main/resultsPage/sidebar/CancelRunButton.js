import React from 'react'
import { Loader, Segment, Button, Transition, Divider, Step, Menu, Header, Accordion, Dropdown } from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'
import {useCancelRunMutation} from '../../../../apollo/hooks'

const CancelRunButton = ({}) => {

  const {userID, runID} = useCrescentContext()
  // let cancelRun, runStatus, loadingCancelRun;
  const {cancelRun, runStatus, loadingCancelRun} = useCancelRunMutation(runID)

  if (runStatus == null){
    return null;
  }

  const runIsSubmitted = R.equals('submitted', runStatus)

  return (
    <Button fluid color='red'
      content={runIsSubmitted ? 'CANCEL PIPELINE' : 'CANCELED PIPELINE'}
      disabled={R.any(RA.isTrue, [R.not(runIsSubmitted), loadingCancelRun])}
      onClick={() => {
        cancelRun()
      }}
    />
  )

}


export default CancelRunButton