


import React, { useState, useCallback, useEffect } from 'react';

import { useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import moment from 'moment'

import { useDropzone } from 'react-dropzone'
import { Form, Card, Header, Button, Segment, Modal, Label, Icon, Grid, List, Message } from 'semantic-ui-react'

import { useOncotreeQuery, useEditDatasetTagsMutation} from '../../../../apollo/hooks/dataset'
import { TagOncotreeModalContent } from '../../runsPage/UploadedDatasetsDetails/index'

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

const TagOncotreeModal = ({
  dataset, tagDataset, addCustomTagDataset, removeCustomTagDataset
}) => {
  const [open, setOpen] = useState(false)
  const oncotree = useOncotreeQuery()
  const tissueTypes = R.isNil(oncotree) ? null : oncotree.tissue

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      size='large'
      closeIcon
      closeOnDimmerClick={false}
      trigger={
        <Button animated='vertical' size='small' onClick={() => setOpen(true)} disabled={R.any(R.isNil, [oncotree, dataset])}>
          <Button.Content visible>
            <Icon name='paperclip' />
          </Button.Content>
          <Button.Content hidden>
            EDIT TAG(S)
          </Button.Content>
        </Button>
      }
    >
      <TagOncotreeModalContent {...{dataset, tissueTypes, tagDataset, addCustomTagDataset, removeCustomTagDataset}}/>
    </Modal>
  )
}

const DatasetCard = ({
  datasetID,
  newProjectDispatch
}) => {

  const { dataset, tagDataset, addCustomTagDataset, removeCustomTagDataset } = useEditDatasetTagsMutation(datasetID)
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
          <Label
            color={R.prop(dataset.cancerTag, {
              true: 'pink',
              false: 'purple',
              null: 'blue',
            })}
            >
              {<Icon style={{margin: 0}} name='paperclip' /> }             
              {<Label.Detail content={dataset.cancerTag ? 'CANCER' : R.equals(dataset.cancerTag, null) ? 'IMMUNE' : 'NON-CANCER'} />}
              {RA.isNotNil(dataset.oncotreeCode) && <Label.Detail content={dataset.oncotreeCode} />}
          </Label>
          {R.map((tag, index) => <Label key={`tag-${index}`} content={<Icon style={{ margin: 0 }} name='paperclip'/>} detail={R.toUpper(tag)} />, dataset.customTags)}
        </Label.Group>
      </Card.Content>
      <Card.Content>
        <Button.Group fluid>
          <Button animated='vertical'
            size='small'
            onClick={() => deleteDataset()}
            color="red"
          >
            <Button.Content visible>
              <Icon name='trash' />
            </Button.Content>
            <Button.Content hidden>
              REMOVE
            </Button.Content>
          </Button>
          <TagOncotreeModal 
            {...{dataset, tagDataset, addCustomTagDataset, removeCustomTagDataset}}
          />
        </Button.Group>
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
          <Icon name='upload' />
          <Header.Content>{R.toUpper(dirSummary.dirName)}</Header.Content>
        </Header>
      </Label>
      <Card.Content>
        <List>
          {
            ["matrix", "barcodes", "features"].map((file) => {
              const { expectedFileName, code } = R.prop(file, dirSummary)
              return (
                <List.Item key={file}>
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
                      {uploadErrMsgs.map(({ file, message }, index) => (
                        <Message.Item key={index}>{R.compose(R.join("/"), R.slice(0, -1), R.split("/"))(file.path)}/<b>{file.name}</b>: {message}</Message.Item>
                      ))}
                    </Message.List>
                  </Message>
                }
                <Grid columns={2} style={{ margin: 0 }}>
                  {
                    uploadSummary.map((dirSummary, index) => (
                      <UploadedDirectoryCard key={index} {...{ dirSummary }} />
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