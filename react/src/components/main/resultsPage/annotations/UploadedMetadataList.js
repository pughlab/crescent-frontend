import React from 'react'

import {Button, Divider, Header, Icon, Image, List, Segment} from 'semantic-ui-react'

import Tada from 'react-reveal/Tada'
import Fade from 'react-reveal/Fade'
import Logo from '../../../login/logo.jpg'

import * as R from 'ramda'
import {useDispatch} from 'react-redux'
import {setActiveSidebarTab} from '../../../../redux/slices/resultsPage'

export default function UploadedMetadataList({ uploadNames }) {
  const dispatch = useDispatch()

  if (R.isNil(uploadNames)) {
    return (
      <Segment
        basic
        placeholder
        style={{ height: '100%' }}
      >
        <Tada forever duration={1000}>
          <Image 
            centered
            src={Logo}
            size="medium"
          />
        </Tada>
      </Segment>
    )
  }

  const {metadata} = uploadNames

  // const runIsPending = R.equals(status, 'pending')
  // const referenceDatasetIDs = R.pluck('datasetID', referenceDatasets)
  // const isReferenceDataset = R.includes(R.__, referenceDatasetIDs)
  // const addReferenceDataset = datasetID => updateRunReferenceDatasets({variables: {datasetIDs: R.uniq([... referenceDatasetIDs, datasetID])}})
  // const removeReferenceDataset = datasetID => updateRunReferenceDatasets({variables: {datasetIDs: R.without([datasetID], referenceDatasetIDs)}})

  // const disableAddingReferences = R.lt(2, R.length(referenceDatasetIDs))

  // const runIsNotCompleted = R.not(R.equals('completed', status))

  if (R.isNil(metadata)) {
    return (
      <Fade up>
        <Divider horizontal content="Uploaded Metadata" />
        <Segment color="purple">
          <Segment placeholder>
            <Header icon>
              <Icon name="exclamation" />
              No Uploaded Metadata
            </Header>
          </Segment>
        </Segment>
      </Fade>
    )
  }

  return (
    <>
      <Divider horizontal content="Uploaded Metadata" />
      <Segment color="purple">
        <List
          celled
          divided
          relaxed
          selection
          size="large"
        >
          <List.Item>
            <List.Content floated="left">
              <List.Header content={metadata} />
            </List.Content>
            <List.Content floated="right">
              <Button
                animated="vertical"
                color="green"
                floated="right"
                onClick={() => dispatch(setActiveSidebarTab({sidebarTab: 'visualizations'}))}
              >
                <Button.Content visible>
                  <Icon
                    name="circle check outline"
                    size="large"
                  />   
                  {' '}
                  {'COMPLETED'}
                </Button.Content>
                <Button.Content hidden>
                  <Icon
                    name="circle check outline"
                    size="large"
                  />  
                  {' '}
                  {'VIEW METADATA'}
                </Button.Content>
              </Button>
            </List.Content>
          </List.Item>
        </List>
      </Segment>
    </>
  )
}