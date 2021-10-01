import React, {useEffect, useState} from 'react'
import {Button, Icon, Label, List} from 'semantic-ui-react'
import moment from 'moment'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useCancelSecondaryRunMutation} from '../../../../apollo/hooks/run'

import {useDispatch} from 'react-redux'
import {resetAnnotations} from '../../../../redux/actions/annotations'
import {setActiveSidebarTab} from '../../../../redux/actions/resultsPage'
import {useAnnotations, useCrescentContext} from '../../../../redux/hooks'

const AnnotationsSecondaryRunEntry = ({ wesID, submittedOn, completedOn: initialCompletedOn, status: initialStatus }) => {
  const dispatch = useDispatch()
  const {logsIsAvailable, logsWasAvailable, secondaryRunWesID} = useAnnotations()
  const {runID} = useCrescentContext()
  const [secondaryRunStatus, setSecondaryRunStatus] = useState(initialStatus)
  const [secondaryRunCompletedOn, setSecondaryRunCompletedOn] = useState(initialCompletedOn)

  const {cancelFailed, cancelSecondaryRun, getStatus, getCompletedOn, loadingCancelSecondaryRun, secondaryRunCompletedOn: secondaryRunCompletedOnFromQuery, secondaryRunStatus: secondaryRunStatusFromPolling} = useCancelSecondaryRunMutation(runID, wesID)

  const runIsSubmitted = R.equals('submitted', secondaryRunStatus)
  const runIsCompleted = R.equals('completed', secondaryRunStatus)

  useEffect(() => {
    if (R.and(
      R.not(runIsSubmitted),
      R.equals(wesID, secondaryRunWesID)
    )) dispatch(resetAnnotations())
  }, [])

  useEffect(() => {
    // Only call getStatus() to execute the lazy query and start polling if the secondary run is currently "submitted"
    if (runIsSubmitted) {
      getStatus()
    } else { // Otherwise, call getCompletedOn() to execute the lazy query to get the completedOn time
      getCompletedOn()
    }
  }, [getStatus, getCompletedOn, runIsSubmitted])

  useEffect(() => {
    if (RA.isNotNil(secondaryRunCompletedOnFromQuery)) setSecondaryRunCompletedOn(secondaryRunCompletedOnFromQuery)
  }, [secondaryRunCompletedOnFromQuery])

  useEffect(() => {
    if (R.both(
      RA.isNotNil,
      R.complement(R.equals)('submitted')
    )(secondaryRunStatusFromPolling)) {
      if (R.equals(wesID, secondaryRunWesID)) dispatch(resetAnnotations())
      setSecondaryRunStatus(secondaryRunStatusFromPolling)
    }
  }, [dispatch, secondaryRunStatusFromPolling, secondaryRunWesID, wesID])

  const color = R.prop(secondaryRunStatus, {
    submitted: 'yellow',
    completed: 'green',
    failed: 'red'
  })

  const icon = R.prop(secondaryRunStatus, {
    submitted: 'circle notch',
    completed: 'circle check outline',
    failed: 'times circle outline'
  })

  return (
    <List.Item>
      <List.Content floated='left'>
        <List.Header content={`wesID: ${R.slice(0, 10, wesID)}`} />
      </List.Content>
      <List.Content floated='left'>
        <Label content={<Icon style={{margin: 0}} name='calendar alternate outline' />} detail={`${moment(submittedOn).format('D MMMM YYYY, h:mm a')}`} />
       </List.Content>
      { secondaryRunCompletedOn && (
        <List.Content floated='left'>
          <Label content={<Icon style={{margin: 0}} name='clock' />} detail={`${moment(secondaryRunCompletedOn).diff(moment(submittedOn), 'seconds')} seconds`}/>
        </List.Content>
      )}
      <List.Content floated='right'>
        {
          <Button floated='right' animated={R.or(runIsCompleted, runIsSubmitted && logsIsAvailable) && 'vertical'} color={color} 
            onClick={() => runIsCompleted ? dispatch(setActiveSidebarTab({sidebarTab: 'visualizations'})) : runIsSubmitted && logsIsAvailable && cancelSecondaryRun()}
          >
            <Button.Content visible>
              <Icon
                name={icon}
                loading={runIsSubmitted}
                size='large'
              />   
              {' '}
              { R.and(runIsSubmitted, logsWasAvailable) ? 'FINISHING' : R.toUpper(secondaryRunStatus) }
            </Button.Content>
            { R.or(runIsCompleted, R.and(runIsSubmitted, logsIsAvailable)) && (
              <Button.Content hidden>
                <Icon
                  name={runIsCompleted ? icon : 'x'}
                  size='large'
                />  
                {' '}
                {runIsCompleted ? 'VIEW RUN' : loadingCancelSecondaryRun ? 'CANCELING RUN' : cancelFailed ? 'CANCEL FAILED' : 'CANCEL RUN'}
              </Button.Content>
            )}
          </Button>
        }
      </List.Content>
    </List.Item>
  )
}

export default AnnotationsSecondaryRunEntry