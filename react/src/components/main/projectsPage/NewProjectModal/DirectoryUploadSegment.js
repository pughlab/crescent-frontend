


import React, {useState, useCallback, useEffect} from 'react';

import { useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import moment from 'moment'

import {queryIsNotNil} from '../../../../utils'

import {useDropzone} from 'react-dropzone'

import {Form, Card, Header, Menu, Button, Segment, Modal, Label, Divider, Icon, Image, Popup, Grid, Step} from 'semantic-ui-react'

const DatasetCard = ({
  datasetID,
  newProjectDispatch
}) => {
  const {loading, data, error} = useQuery(gql`
    query DatasetDetails(
      $datasetID: ID!
    ) {
      dataset(datasetID: $datasetID) {
        datasetID
        name
        hasMetadata
      }
    }
  `, {
    variables: {datasetID}
  })

  // Mutation to delete uploaded dataset
  const [deleteDataset, {}] = useMutation(gql`
    mutation DeleteDataset(
      $datasetID: ID!
    ) {
      deleteDataset(
        datasetID: $datasetID
      ) {
        datasetID
      }
    }
  `, {
    variables: {datasetID},
    onCompleted: ({deleteDataset}) => {
      if (RA.isNotNil(deleteDataset)) {
        const {datasetID} = deleteDataset
        newProjectDispatch({type: 'REMOVE_DATASET', datasetID})
      }
    }
  })

  const dataset = R.ifElse(
    queryIsNotNil('dataset'),
    R.prop('dataset'),
    R.always(null)
  )(data)
  console.log(dataset)
  return (
    RA.isNotNil(dataset) &&
    <Card>
      <Card.Content>
        <Card.Header as={Header} sub content={dataset.name} />
      </Card.Content>
      <Card.Content>
        <Label content='Metadata' detail={dataset.hasMetadata ? 'Yes' : 'No'} />
      </Card.Content>
      <Card.Content>
        <Button fluid animated='vertical'
          size='small'
          onClick={() => deleteDataset()}
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
  newProjectState, newProjectDispatch,
}) => {
  // GQL mutation to create a dataset on mount
  const [createDataset, {}] = useMutation(gql`
    mutation CreateDataset(
      $name: String!
      $matrix: Upload!
      $features: Upload!
      $barcodes: Upload!
      $metadata: Upload
    ) {
      createDataset(
        name: $name
        matrix: $matrix
        features: $features
        barcodes: $barcodes
        metadata: $metadata
      ) {
        datasetID
      }
    }
  `, {
    onCompleted: ({createDataset}) => {
      if (RA.isNotNil(createDataset)) {
        const {datasetID} = createDataset
        newProjectDispatch({type: 'ADD_DATASET', datasetID})
      }
    }
  })
  // Callback function for drag and drop
  const onDrop = useCallback(acceptedFiles => {
    if (RA.isNotEmpty(acceptedFiles)) {
      // Predicate for valid directory upload
      const isValidDatasetDir = R.compose(
        R.all(RA.isNotNil),
        R.props(['matrix', 'features', 'barcodes'])
      )
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
        // Call GQL mutation for each valid directory dropped
        R.map(
          ({directoryName, ...files}) => createDataset({variables: {name: directoryName, ...files}})
        ),
        // Filter objects
        R.filter(isValidDatasetDir),
        // Group array of accepted files into objects
        R.map(
          ([directoryName, files]) => ({directoryName, ... checkDirectoryForRequiredFiles(files)})
        ),
        R.toPairs,
        groupByDirectory
      )(acceptedFiles)
    }
  }, [])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})
  return (
    <div {...getRootProps()}>
    <Segment placeholder>
      <Header textAlign='center' content='Drag and drop single-cell sample dataset directory' />
      <Card.Group itemsPerRow={4}>
      {

        R.compose(
          R.map(
            datasetID =>
              <DatasetCard key={datasetID}
                {...{datasetID, newProjectDispatch}}
              />
          ),
          R.prop('uploadedDatasetIDs')
        )(newProjectState)
      }
      </Card.Group>
    </Segment>
    </div>
  )
}

export default DirectoryUploadSegment