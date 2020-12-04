import React from 'react'
import { Loader, Segment, Button, Transition, Divider, Step, Menu, Header, Accordion, Dropdown } from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'
import {useCancelRunMutation} from '../../../../apollo/hooks'

const CancelRunButton = ({}) => {

  const {userID, runID} = useCrescentContext()
  // let cancelRun, runStatus, loadingCancelRun;
  const {cancelRun, runStatus, loadingCancelRun, cancelFailed, cancellable} = useCancelRunMutation(runID)

  if (runStatus == null){
    return null;
  }

  const runIsSubmitted = R.equals('submitted', runStatus)

  return (
    <Button fluid color='red'
      content={loadingCancelRun ? 'ATTEMPTING TO CANCEL' : cancelFailed ? "CANCEL FAILED, TRY AGAIN?" : runIsSubmitted ? "CANCEL PIPELINE" : "PIPELINE ENDED, REFRESH PAGE"}
      disabled={R.any(RA.isTrue, [R.not(runIsSubmitted), loadingCancelRun, R.not(cancellable)])}
      onClick={() => {
        cancelRun()
      }}
    />
  )

}


export default CancelRunButton