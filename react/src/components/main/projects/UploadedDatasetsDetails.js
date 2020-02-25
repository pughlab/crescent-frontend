import React, {useState, useEffect} from 'react';

import {Container, Card, Divider, Button, Header, Icon, Modal, Dropdown, Label, Segment, Grid, Step, Transition} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import moment from 'moment'
import filesize from 'filesize'

import withRedux from '../../../redux/hoc'

import { useQuery, useLazyQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {queryIsNotNil} from '../../../utils'


const UploadedDatasetsDetails = withRedux(({
  actions: {setProject},
  app: {
    user: {
      userID: currentUserID
    },
    project: {
      uploadedDatasets
    },
    view: {
      isGuest
    }
  },
}) => { 
  return (
    RA.isNotNil(uploadedDatasets) &&
    RA.isNotEmpty(uploadedDatasets) &&
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
})

export default UploadedDatasetsDetails