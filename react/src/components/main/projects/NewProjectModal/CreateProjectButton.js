


import React, {useState, useCallback, useEffect} from 'react';

import { useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import moment from 'moment'

import {queryIsNotNil} from '../../../../utils'

import {useDropzone} from 'react-dropzone'

import {Form, Card, Header, Menu, Button, Segment, Modal, Label, Divider, Icon, Image, Popup, Grid, Step} from 'semantic-ui-react'

import withRedux from '../../../../redux/hoc'

const DatasetCard = ({
  dataset
}) => {
  // Get directory name from matrix file
  const dirName = R.compose(
    R.prop(1),
    R.split('/'),
    R.prop('path'),
    R.prop('matrix')
  )(dataset)

  const hasMetadata = R.compose(
    RA.isNotNil,
    R.prop('metadata')
  )(dataset)

  return (
    <Card>
      <Card.Content>
        <Card.Header as={Header} sub content={dirName} />
      </Card.Content>
      <Card.Content>
        <Label content='Metadata' detail={hasMetadata ? 'Yes' : 'No'} />
      </Card.Content>
    </Card>
  )
}

const CreateProjectButton = ({
  name, setName,
  description, setDescription,
  datasetDirectories, setDatasetDirectories,
  existingDatasets, setExistingDatasets
}) => {
  const disabled = R.any(RA.isTrue, [
    R.isEmpty(name),
    R.isEmpty(description),
    R.and(R.isEmpty(datasetDirectories), R.isEmpty(existingDatasets))
  ])
  return (
    <Button size='huge' fluid
      disabled={disabled}
      content='Create Project'
    />
  )
}

export default CreateProjectButton