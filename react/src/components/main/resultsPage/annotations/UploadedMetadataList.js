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

export default function UploadedMetadataList({
  runID
}) {
  const dispatch = useDispatch()
  const run = useRunDetailsQuery(runID)

  if (R.any(R.isNil, [run])) {
    return (
      <Segment basic style={{ height: '100%' }} placeholder>
        <Tada forever duration={1000}>
          <Image src={Logo} centered size='medium' />
        </Tada>
      </Segment>
    )
  }

  const {uploadNames: {metadata}} = run

  // const runIsPending = R.equals(status, 'pending')
  // const referenceDatasetIDs = R.pluck('datasetID', referenceDatasets)
  // const isReferenceDataset = R.includes(R.__, referenceDatasetIDs)
  // const addReferenceDataset = datasetID => updateRunReferenceDatasets({variables: {datasetIDs: R.uniq([... referenceDatasetIDs, datasetID])}})
  // const removeReferenceDataset = datasetID => updateRunReferenceDatasets({variables: {datasetIDs: R.without([datasetID], referenceDatasetIDs)}})

  // const disableAddingReferences = R.lt(2, R.length(referenceDatasetIDs))

  // const runIsNotCompleted = R.not(R.equals('completed', status))

  if (R.isNil(metadata)) {
    return(
      <Fade up>
      <Divider horizontal content={'Uploaded Metadata'} />
      <Segment color='purple'>    
        <Segment placeholder>
          <Header icon>
            <Icon name='exclamation' />
            No Uploaded Metadata
          </Header>
        </Segment>
      </Segment>
      </Fade>
    )
  }

  return (
    <>
      <Divider horizontal content={'Uploaded Metadata'} />
      <Segment color='purple'>
        <List divided relaxed selection celled size='large'>
          <List.Item key={metadata} >
            <List.Content floated='left'>
              <List.Header content={metadata} />
            </List.Content>
            <List.Content floated='right'>
              {
                <Button floated='right' animated='vertical' color='green'
                  onClick={() => dispatch(setActiveSidebarTab({sidebarTab: 'visualizations'}))}
                >
                  <Button.Content visible>
                    <Icon
                      name='circle check outline'
                      size='large'
                    />   
                    {' '}
                    {'COMPLETED'}
                  </Button.Content>
                  <Button.Content hidden>
                    <Icon
                      name='circle check outline'
                      size='large'
                    />  
                    {' '}
                    {'VIEW METADATA'}
                  </Button.Content>
                </Button>
              }
            </List.Content>
          </List.Item>
        </List>
      </Segment>
    </>
  )
}





{/* <List.Content floated='right'>
{
    <Button floated='right' color='green'
      onClick={() => dispatch(setActiveSidebarTab({sidebarTab: 'visualizations'}))}
    >
      <Icon
        name='circle check outline'
        size='large'
      />   
      {' '}
      {R.toUpper('completed')}
    </Button>
}
</List.Content> */}