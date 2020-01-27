


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
  dataset,
  datasetDirectories, setDatasetDirectories
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
      <Card.Content>
        <Button fluid animated='vertical'
          size='small'
          onClick={() => setDatasetDirectories(R.without([dataset], datasetDirectories))}
        >
          <Button.Content visible>
            <Icon name='trash' />
          </Button.Content>
          <Button.Content hidden>
            REMOVE
          </Button.Content>
        </Button>
      </Card.Content>
    </Card>
  )
}

const DirectoryUploadSegment = ({
  datasetDirectories, setDatasetDirectories
}) => {
  const [datasetDirs, setDatasetDirs] = useState([])
  const isValidDatasetDir = R.compose(
    R.all(RA.isNotNil),
    R.props(['matrix', 'features', 'barcodes'])
  )
  const onDrop = useCallback(acceptedFiles => {
    console.log(acceptedFiles)
    // Group flat array of files into first level directory
    // [] => {directoryName: [File]}
    const groupByDirectory = R.groupBy(R.compose(
      R.prop(1),
      R.split('/'),
      R.prop('path')
    ))
    // Check that directory has expected files
    // [] => {matrix, barcodes, features, metadata: File}
    const checkDirectoryForRequiredFiles = R.reduce(
      (dataset, file) => {
        const nameEquals = filename => R.compose(R.equals(filename), R.prop('name'))
        const addToDataset = R.assoc(R.__, R.__, dataset)
        return R.cond([
          [nameEquals('matrix.mtx.gz'), addToDataset('matrix')],
          [nameEquals('barcodes.tsv.gz'), addToDataset('barcodes')],
          [nameEquals('features.tsv.gz'), addToDataset('features')],
          [nameEquals('metadata.tsv'), addToDataset('metadata')],
          [R.T, R.always(dataset)]
        ])(file)
      },
      {matrix: null, features: null, barcodes: null, metadata: null}
    )
    R.compose(
      setDatasetDirs,
      R.filter(isValidDatasetDir),
      R.map(checkDirectoryForRequiredFiles),
      R.values,
      groupByDirectory
    )(acceptedFiles)
  }, [])

  useEffect(() => {
    setDatasetDirectories(R.concat(datasetDirs, datasetDirectories))
  }, [datasetDirs])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})
  return (
    <div {...getRootProps()}>
    <Segment placeholder>
      <Header textAlign='center' content='Drag and drop single-cell sample dataset directory' />
      <Card.Group itemsPerRow={4}>
      {
        R.addIndex(R.map)(
          (dataset, index) => <DatasetCard {...{dataset, datasetDirectories, setDatasetDirectories}} key={index} />,
          datasetDirectories
        )
      }
      </Card.Group>
    </Segment>
    </div>
  )
}

export default DirectoryUploadSegment