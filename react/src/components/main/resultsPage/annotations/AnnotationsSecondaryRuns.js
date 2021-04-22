import React, {useState, useCallback, useEffect} from 'react'

import {Button, Icon, Segment, List, Message, Divider, Label, Image, Header} from 'semantic-ui-react'

import Tada from 'react-reveal/Tada'
import Fade from 'react-reveal/Fade'
import Logo from '../../../login/logo.jpg'

import * as RA from 'ramda-adjunct'
import * as R from 'ramda'
import moment from 'moment'
import {useDispatch} from 'react-redux'


// import {useSecondaryRunDetailsQuery} from '../../../../apollo/hooks/run'
import {useRunDetailsQuery} from '../../../../apollo/hooks/run'
import {setActiveSidebarTab} from '../../../../redux/actions/resultsPage'

export default function AnnotationsSecondaryRuns({
  secondaryRuns
}) {
  const dispatch = useDispatch()
  // const run = useRunDetailsQuery(runID)

  // if (R.any(R.isNil, [run])) {
  //   return (
  //     <Segment basic style={{ height: '100%' }} >
  //       <Tada forever duration={1000}>
  //         <Image src={Logo} centered size='medium' />
  //       </Tada>
  //     </Segment>
  //   )
  // }

  // const {secondaryRuns} = run

  // const runIsPending = R.equals(status, 'pending')
  // const referenceDatasetIDs = R.pluck('datasetID', referenceDatasets)
  // const isReferenceDataset = R.includes(R.__, referenceDatasetIDs)
  // const addReferenceDataset = datasetID => updateRunReferenceDatasets({variables: {datasetIDs: R.uniq([... referenceDatasetIDs, datasetID])}})
  // const removeReferenceDataset = datasetID => updateRunReferenceDatasets({variables: {datasetIDs: R.without([datasetID], referenceDatasetIDs)}})

  // const disableAddingReferences = R.lt(2, R.length(referenceDatasetIDs))

  // const runIsNotCompleted = R.not(R.equals('completed', status))

  if (R.isEmpty(secondaryRuns)) {
    return(
      <Fade up>
      <Divider horizontal content={'GSVA Run Status'} />
      <Segment color='purple'>    
        <Segment placeholder>
          <Header icon>
            <Icon name='exclamation' />
            No GSVA Runs
          </Header>
        </Segment>
      </Segment>
      </Fade>
    )
  }

  return (
    <>
      <Divider horizontal content={'GSVA Run Status'} />
      <Segment color='purple'>
        <List divided relaxed selection celled size='large'>
          {
            R.compose(
              R.map(({wesID, status, submittedOn, completedOn}) => {

                const color = R.prop(status, {
                  submitted: 'yellow',
                  completed: 'green',
                  failed: 'red'
                })

                const icon = R.prop(status, {
                  submitted: 'circle notch',
                  completed: 'circle check outline',
                  failed: 'times circle outline'
                })

                const runIsSubmitted = R.equals('submitted', status)
                const runIsCompleted = R.equals('completed', status)
                const runIsFailed = R.equals('failed', status)

                return (
                  <List.Item key={wesID} >
                    <List.Content floated='left'>
                      <List.Header content={`wesID: ${R.slice(0, 10, wesID)}`} />
                    </List.Content>
                    <List.Content floated='left'>
                      <Label content={<Icon style={{margin: 0}} name='calendar alternate outline' />} detail={`${moment(submittedOn).format('D MMMM YYYY, h:mm a')}`} />
                     </List.Content>
                    <List.Content floated='left'>
                      <Label content={<Icon style={{margin: 0}} name='clock' />} detail={`${moment(RA.isNotNil(completedOn) ? completedOn : new Date()).diff(moment(submittedOn), 'seconds')} seconds`}/>
                    </List.Content>
                    
                    <List.Content floated='right'>
                      {
                        <Button floated='right' animated='vertical' color={color} 
                          onClick={() => runIsCompleted ? dispatch(setActiveSidebarTab({sidebarTab: 'visualizations'})) : null}
                        >
                          <Button.Content visible>
                            <Icon
                              name={icon}
                              loading={runIsSubmitted}
                              size='large'
                            />   
                            {' '}
                            {R.toUpper(status)}
                          </Button.Content>
                          <Button.Content hidden>
                            <Icon
                              name={runIsCompleted ? icon : 'x'}
                              size='large'
                            />  
                            {' '}
                            {runIsCompleted ? 'VIEW RUN' : runIsSubmitted ? 'CANCEL RUN' : null}
                          </Button.Content>
                        </Button>
                      }
                    </List.Content>
                    
                  </List.Item>
                )
              })
            )(R.reverse(secondaryRuns))
          }
        </List>
      </Segment>
    </>
  )
}