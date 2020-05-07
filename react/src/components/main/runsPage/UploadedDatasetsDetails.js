import React, {useState, useEffect} from 'react';

import {Container, Card, Divider, Button, Header, Icon, Modal, Dropdown, Label, Segment, Grid, Step, Transition} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useProjectDetailsQuery} from '../../../apollo/hooks'
import {useCrescentContext} from '../../../redux/hooks'

const UploadedDatasetsDetails = ({
}) => {
  const {userID: currentUserID, projectID} = useCrescentContext()
  const project = useProjectDetailsQuery(projectID)
  if (R.isNil(project)) {
    return null
  }
  const {uploadedDatasets} = project
  return (
    <Segment attached>
      <Divider horizontal>
        <Header content={'Uploaded Datasets'} />
      </Divider>
      <Label.Group size='large'>
      {
        R.compose(
          R.addIndex(R.map)(
            ({name, datasetID}, index) => (
              <Label key={index} content={name} />
            )
          )
        )(uploadedDatasets)
      }
      </Label.Group>
    </Segment>
  )
}

export default UploadedDatasetsDetails