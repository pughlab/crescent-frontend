


import React, { useState, useCallback, useEffect } from 'react';

import { useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import moment from 'moment'

import { queryIsNotNil } from '../../../../utils'

import { useDropzone } from 'react-dropzone'

import { Form, Card, Header, Menu, Button, Segment, Modal, Label, Divider, Icon, Image, Popup, Grid, Step, List, Item, Message, Container } from 'semantic-ui-react'

const maxFileSize = 209715200
const validFileTypes = ['.mtx.gz', '.tsv.gz']
const formatSize = (size) => R.cond([
  [R.lte(1024 ** 2), R.always(`${Math.round(size / 1024 ** 2 * 10) / 10}MB`)],
  [R.lte(1024), R.always(`${Math.round(size / 1024 * 10) / 10}KB`)],
  [R.T, size => `${size}B`]
])(size)
const errorsToMsg = (errorList) => {
  const { code, message } = errorList[0]
  if (R.equals(code, "file-invalid-type")) { return `file type must be one of ${R.join(", ", validFileTypes)}` }
  else if (R.equals(code, "file-too-large")) { return `file size must not exceed ${formatSize(maxFileSize)}` }
  return R.toLower(message)
}

const DatasetCard = ({
  datasetID,
  newProjectDispatch
}) => {
  const { loading, data, error } = useQuery(gql`
    query DatasetDetails(
      $datasetID: ID!
    ) {
      dataset(datasetID: $datasetID) {
        datasetID
        name
        size
        numGenes
        numCells
      }
    }
  `, {
    variables: { datasetID }
  })

  // Mutation to delete uploaded dataset
  const [deleteDataset, { }] = useMutation(gql`
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
    variables: { datasetID },
    onCompleted: ({ deleteDataset }) => {
      if (RA.isNotNil(deleteDataset)) {
        const { datasetID } = deleteDataset
        newProjectDispatch({ type: 'REMOVE_DATASET', datasetID })
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
        <Card.Header as={Header} content={dataset.name} />
      </Card.Content>
      <Card.Content>
        <Label.Group>
          <Label content={<Icon style={{ margin: 0 }} name='folder' />} detail={formatSize(dataset.size)} />
          <Label content={<Icon style={{ margin: 0 }} name='certificate' />} detail={`${dataset.numCells} cells`} />
          <Label content={<Icon style={{ margin: 0 }} name='dna' />} detail={`${dataset.numGenes} genes`} />
        </Label.Group>
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

const UploadedDirectoryCard = ({
  dirSummary
}) => (
  <Grid.Column>
    <Card fluid color={dirSummary.isValid ? "green" : "red"}>
      <Label attached='top' color={dirSummary.isValid ? "green" : "red"}>
        <Header size="small" textAlign="center" style={{ color: "#FFFFFF" }} >
          <Icon name='folder open outline' />
          <Header.Content>{R.toUpper(dirSummary.dirName)}</Header.Content>
        </Header>
      </Label>
      <Card.Content>
        <List>
          {
            ["matrix", "barcodes", "features"].map((file) => {
              const { expectedFileName, code } = R.prop(file, dirSummary)
              return (
                <List.Item>
                  <List.Icon verticalAlign="middle" name={(R.equals(code, "valid") ? "check" : "exclamation") + " circle"} color={R.equals(code, "valid") ? "green" : "red"} />
                  <List.Content>{expectedFileName} <span style={{ color: R.equals(code, "valid") ? "green" : "red" }}>{code}</span></List.Content>
                </List.Item>
              )
            })
          }
        </List>
      </Card.Content>
    </Card>
  </Grid.Column>
)

// Callback function for drag and drop
const useOnDropAcceptedCallback = (createDataset, setUploadSummary, setUploadErrMsgs) => useCallback(acceptedFiles => {
  if (RA.isNotEmpty(acceptedFiles)) {
    // Group flat array of files into first level directory ([] => {directoryName: [File]})
    const groupByDirectory = R.groupBy(R.compose(
      R.prop(1),
      R.split('/'),
      R.prop('path')
    ))
    // Check that directory has expected files ([] => {matrix: File, barcodes: File, features: File})
    const checkDirectoryForRequiredFiles = R.reduce(
      (dataset, file) => {
        const nameEquals = filename => R.compose(R.equals(filename), R.prop('name'))
        const addToDataset = R.assoc(R.__, R.__, dataset)
        return R.cond([
          [nameEquals('matrix.mtx.gz'), addToDataset('matrix')],
          [nameEquals('barcodes.tsv.gz'), addToDataset('barcodes')],
          [nameEquals('features.tsv.gz'), addToDataset('features')],
          [R.T, R.always(dataset)]
        ])(file)
      },
      { matrix: null, features: null, barcodes: null }
    )
    // Group array of accepted files into directory objects
    const uploadedDirs = R.compose(
      R.map(
        ([directoryName, files]) => ({ directoryName, ...checkDirectoryForRequiredFiles(files) })
      ),
      R.toPairs,
      groupByDirectory
    )(acceptedFiles)

    // get a summary of upload result and the valid directories that will be uploaded
    const { uploadSummary, validDatasetDir } = uploadedDirs.reduce(({ uploadSummary, validDatasetDir }, dir) => {
      const getCode = file => R.isNil(R.prop(file, dir)) ? "missing" : "valid"
      const dirSummary = {
        dirName: dir.directoryName,
        barcodes: { expectedFileName: "barcodes.tsv.gz", code: getCode("barcodes") },
        matrix: { expectedFileName: "matrix.mtx.gz", code: getCode("matrix") },
        features: { expectedFileName: "features.tsv.gz", code: getCode("features") },
      }
      // check if the code for all 3 files are "valid"
      const isValid = R.compose(R.all(R.equals("valid")), R.pluck("code"), R.props(['matrix', 'features', 'barcodes']))(dirSummary)
      return {
        uploadSummary: R.append({ ...dirSummary, isValid }, uploadSummary),
        validDatasetDir: isValid ? R.append(dir, validDatasetDir) : validDatasetDir
      }
    }, { uploadSummary: [], validDatasetDir: [] })
    setUploadSummary(uploadSummary)

    // Call GQL mutation for each valid directory dropped
    R.map(
      ({ directoryName, ...files }) => createDataset({ variables: { name: directoryName, ...files } }), validDatasetDir
    )
  } else {
    setUploadErrMsgs({ file: null, message: "Empty folder uploaded!" })
  }
}, [])

const DirectoryUploadSegment = ({
  newProjectState, newProjectDispatch,
}) => {
  const [uploadSummary, setUploadSummary] = useState([])
  const [uploadErrMsgs, setUploadErrMsgs] = useState([])

  // GQL mutation to create a dataset on mount
  const [createDataset, { loading }] = useMutation(gql`
    mutation CreateDataset(
      $name: String!
      $matrix: Upload!
      $features: Upload!
      $barcodes: Upload!
    ) {
      createDataset(
        name: $name
        matrix: $matrix
        features: $features
        barcodes: $barcodes
      ) {
        datasetID
      }
    }
  `, {
    onCompleted: ({ createDataset }) => {
      if (RA.isNotNil(createDataset)) {
        const { datasetID } = createDataset
        newProjectDispatch({ type: 'ADD_DATASET', datasetID })
      }
    }
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: validFileTypes,
    maxSize: maxFileSize,
    onDrop: (files) => { if (R.isEmpty(files)) setUploadErrMsgs(null) },
    onDropAccepted: useOnDropAcceptedCallback(createDataset, setUploadSummary, setUploadErrMsgs),
    onDropRejected: errors => setUploadErrMsgs(errors.map(({ file, errors }) => ({ file, message: errorsToMsg(errors) })))
  })

  return (
    <div {...getRootProps()}>
      <Modal
        size="small"
        onClose={() => { setUploadSummary([]); setUploadErrMsgs([]) }}
        open={R.or(RA.isNotEmpty(uploadSummary), RA.isNotEmpty(uploadErrMsgs))}
      >
        <Modal.Header>
          Upload Summary
        </Modal.Header>
        <Modal.Content scrolling>
          {
            R.isNil(uploadErrMsgs) ? (
              <Message style={{ margin: 0 }} error>
                Empty folder(s) uploaded!
              </Message>
            ) : (
              <>
                {R.isEmpty(uploadErrMsgs) ||
                  <Message style={{ margin: 0 }} error>
                    <Header>
                      Rejected files:
                    </Header>
                    <Message.List>
                      {uploadErrMsgs.map(({ file, message }) => (
                        <Message.Item>{R.compose(R.join("/"), R.slice(0, -1), R.split("/"))(file.path)}/<b>{file.name}</b>: {message}</Message.Item>
                      ))}
                    </Message.List>
                  </Message>
                }
                <Grid columns={2} style={{ margin: 0 }}>
                  {
                    uploadSummary.map((dirSummary) => (
                      <UploadedDirectoryCard {...{ dirSummary }} />
                  ))}
                </Grid>
              </>
          )}
        </Modal.Content>
        <Modal.Actions>
          <Button
            content="Close"
            onClick={() => { setUploadSummary([]); setUploadErrMsgs([]) }}
          />
        </Modal.Actions>
      </Modal>
      <Segment placeholder loading={loading}>
        <Header textAlign='center' >
          Drag and drop single-cell sample dataset directory
          <a target="_blank" href='https://pughlab.github.io/crescent-frontend/#item-2-1'> (see required files and formats)</a>
        </Header>
        <Card.Group itemsPerRow={4}>
          {
            R.compose(
              R.map(datasetID => <DatasetCard key={datasetID} {...{ datasetID, newProjectDispatch }} />),
              R.prop('uploadedDatasetIDs')
            )(newProjectState)
          }
        </Card.Group>
      </Segment>
    </div>
  )
}

export default DirectoryUploadSegment