import React, {useEffect, useState} from 'react'
import {useActor} from '@xstate/react'
import {Button, Icon, Label, List} from 'semantic-ui-react'
import moment from 'moment'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useSecondaryRunStatusQuery} from '../../../../apollo/hooks/run'

import {useDispatch} from 'react-redux'
import {setActiveSidebarTab} from '../../../../redux/actions/resultsPage'
import {useMachineServices, useCrescentContext} from '../../../../redux/hooks'
import {useSecondaryRunEvents} from '../../../../xstate/hooks'

const AnnotationsSecondaryRunEntry = ({ wesID, submittedOn, completedOn: initialCompletedOn, status: initialStatus }) => {
  const dispatch = useDispatch()
  const {annotationsService: service} = useMachineServices()
  const {runID} = useCrescentContext()
  const [secondaryRunStatus, setSecondaryRunStatus] = useState(initialStatus)
  const [secondaryRunCompletedOn, setSecondaryRunCompletedOn] = useState(initialCompletedOn)
  const [isPolling, setIsPolling] = useState(false)
  const {cancelSecondaryRun} = useSecondaryRunEvents()

  const {getStatus, getCompletedOn, secondaryRunCompletedOn: secondaryRunCompletedOnFromQuery, secondaryRunStatus: secondaryRunStatusFromPolling, stopStatusPolling} = useSecondaryRunStatusQuery(runID, wesID)

  const runIsSubmitted = R.equals('submitted', secondaryRunStatus)
  const runIsCompleted = R.equals('completed', secondaryRunStatus)

  const [{context: {logs, secondaryRunWesID}, matches}] = useActor(service)
  const logsIsAvailable = RA.isNotNil(logs)
  const cancelLoading = R.and(
    R.any(matches, ['cancelProcessing', 'secondaryRunCanceled']),
    R.equals(secondaryRunWesID, wesID)
  )
  const cancelFailed = matches('cancelFailed')

  useEffect(() => {
    // Only call getStatus() to execute the lazy query and start polling if the secondary run is currently "submitted"
    if (runIsSubmitted) {
      getStatus()
      setIsPolling(true)
    } else { // Otherwise, call getCompletedOn() to execute the lazy query to get the completedOn time
      getCompletedOn()
    }
  }, [getStatus, getCompletedOn, runIsSubmitted, setIsPolling])

  useEffect(() => {
    if (isPolling && !runIsSubmitted) stopStatusPolling()
  }, [isPolling, runIsSubmitted, stopStatusPolling])

  useEffect(() => {
    if (RA.isNotNil(secondaryRunCompletedOnFromQuery)) setSecondaryRunCompletedOn(secondaryRunCompletedOnFromQuery)
  }, [secondaryRunCompletedOnFromQuery])

  useEffect(() => {
    if (R.both(
      RA.isNotNil,
      R.complement(R.equals)('submitted')
    )(secondaryRunStatusFromPolling)) {
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
          <Button floated='right' animated={R.any(RA.isTrue, [runIsCompleted, R.and(runIsSubmitted, logsIsAvailable), cancelLoading]) && 'vertical'} color={color} 
            onClick={async () => {
              if (runIsCompleted) {
                dispatch(setActiveSidebarTab({sidebarTab: 'visualizations'}))
              } else if (logsIsAvailable) {
                cancelSecondaryRun({
                  cancelOptions: {
                    variables: {
                      wesID
                    }
                  }
                })
              }
            }}
          >
            <Button.Content visible>
              <Icon
                name={icon}
                loading={runIsSubmitted}
                size='large'
              />   
              {' '}
              { R.toUpper(secondaryRunStatus) }
            </Button.Content>
            { R.any(RA.isTrue, [runIsCompleted, R.and(runIsSubmitted, logsIsAvailable), cancelLoading]) && (
              <Button.Content hidden>
                <Icon
                  name={runIsCompleted ? icon : 'x'}
                  size='large'
                />  
                {' '}
                {runIsCompleted ? 'VIEW RUN' : cancelLoading ? 'CANCELING RUN' : cancelFailed ? 'CANCEL FAILED' : 'CANCEL RUN'}
              </Button.Content>
            )}
          </Button>
        }
      </List.Content>
    </List.Item>
  )
}

export default AnnotationsSecondaryRunEntry