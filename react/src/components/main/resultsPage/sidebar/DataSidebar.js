import React, {useState, useEffect, useRef} from 'react';

import { Segment, Button, Icon, Step, Header, Modal, Dropdown, Form, Divider, Menu, Label } from 'semantic-ui-react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useDispatch} from 'react-redux'
import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'
import {useRunDetailsQuery} from '../../../../apollo/hooks/run'

import UploadRunMetadataButton from './UploadRunMetadataButton'

const DataSidebar = ({
}) => {    
  const {userID: currentUserID, runID} = useCrescentContext()


  const run = useRunDetailsQuery(runID)

  const dispatch = useDispatch()

  if (R.any(R.isNil, [run])) {
    return null
  }
  const {status: runStatus, name: runName, createdBy: {userID: creatorUserID}} = run
  const disabledUpload = R.not(R.equals(currentUserID, creatorUserID))
  return (
    <>
    <Modal basic size='small'
      trigger={
        <Button
          color='teal'
          animated='vertical'
          fluid
        >
          <Button.Content visible><Icon name='upload'/></Button.Content>
          <Button.Content hidden content='Upload Metadata'/>
        </Button>
      }
    >
      <Modal.Content>
        <Segment attached='top'>
          <Header>
            <Icon name='upload'/> 
            <Header.Content>
              {runName}
              <Header.Subheader>
                Upload/Replace metadata for this Run in this <a target="_blank" href='https://pughlab.github.io/crescent-frontend/#item-2-2' >format.</a> 
              </Header.Subheader>
            </Header.Content>
          </Header>
        </Segment>          
        <Segment attached='bottom'>
          {
          disabledUpload ? 
            <Segment placeholder>
              <Header textAlign='center'
                content={'You do not have permissions to upload metadata for this dataset'}
              />
            </Segment>
          :
            <UploadRunMetadataButton {...{runID}} />
          }
          </Segment>
      </Modal.Content>
    </Modal>
      </>
    )
}

export default DataSidebar