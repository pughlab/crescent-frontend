import React, { useCallback, useEffect, useState } from 'react'
import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { Button, Card, Grid, Header, Icon, Label, List, Message, Modal, Segment } from 'semantic-ui-react'
import { useDropzone } from 'react-dropzone'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { useDatasetUploadMachine } from '../../../../xstate/hooks'

import { useEditDatasetTagsMutation, useOncotreeQuery } from '../../../../apollo/hooks/dataset'

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

  return R.cond([
    [R.equals('file-invalid-type'), R.always(`file type must be one of ${R.join(", ", validFileTypes)}`)],
    [R.equals('file-too-large'), R.always(`file size must be less than ${formatSize(maxFileSize)}`)],
    [R.T, R.compose(R.always, R.toLower)(message)]
  ])(code)
}

const TagOncotreeModal = ({
  dataset,
  tagDataset,
  addCustomTagDataset,
  removeCustomTagDataset
}) => {
  const [open, setOpen] = useState(false)
  const oncotree = useOncotreeQuery()
  const tissueTypes = R.propOr(null, 'tissue')(oncotree)

  return (
    <Modal
      closeIcon
      closeOnDimmerClick={false}
      open={open}
      onClose={() => setOpen(false)}
      size="large"
      trigger={
        <Button
          animated="vertical"
          disabled={R.any(R.isNil, [oncotree, dataset])}
          onClick={() => setOpen(true)}
          size="small"
        >
          <Button.Content visible>
            <Icon name="paperclip" />
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
  const [deleteDataset] = useMutation(gql`
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

  return RA.isNotNil(dataset) && (
    <Card onClick={e => e.stopPropagation()}>
      <Card.Content>
        <Card.Header as={Header} content={dataset.name} />
      </Card.Content>
      <Card.Content>
        <Label.Group>
          <Label content={<Icon style={{ margin: 0 }} name="folder" />} detail={formatSize(dataset.size)} />
          <Label content={<Icon style={{ margin: 0 }} name="certificate" />} detail={`${dataset.numCells} cells`} />
          <Label content={<Icon style={{ margin: 0 }} name="dna" />} detail={`${dataset.numGenes} genes`} />
          <Label color={R.prop(dataset.cancerTag, {
            'cancer': 'pink',
            'non-cancer': 'purple',
            'immune': 'blue'
          })}>
              <Icon style={{ margin: 0 }} name="paperclip" />
              <Label.Detail content={R.toUpper(dataset.cancerTag)} />
              { RA.isNotNil(dataset.oncotreeCode) && <Label.Detail content={dataset.oncotreeCode} /> }
          </Label>
          { R.addIndex(R.map)(
            (tag, index) => (
              <Label
                key={`tag-${index}`}
                content={<Icon style={{ margin: 0 }} name="paperclip" />}
                detail={R.toUpper(tag)}
              />
            ),
            dataset.customTags
          )}
        </Label.Group>
      </Card.Content>
      <Card.Content>
        <Button.Group fluid>
          <Button
            animated="vertical"
            color="red"
            onClick={() => deleteDataset()}
            size="small"
          >
            <Button.Content visible>
              <Icon name="trash" />
            </Button.Content>
            <Button.Content hidden>
              REMOVE
            </Button.Content>
          </Button>
          <TagOncotreeModal {...{dataset, tagDataset, addCustomTagDataset, removeCustomTagDataset}} />
        </Button.Group>
      </Card.Content>
    </Card>
  )
}

const DirectoryStatusCard = ({
  createDataset,
  dirIndex,
  dirSummary: {
    dirName,
    files,
    ...restDirSummary
  },
  setUploadStatuses
}) => {
  const [{ matches, value }, send] = useDatasetUploadMachine(createDataset)

  const uploadDirectoryFiles = useCallback(() => {
    if (RA.isNotNil(files)) {
      const { directoryName, ...directoryfiles } = files

      send({
        type: 'UPLOAD_INPUT',
        uploadOptions: {
          variables: {
            ...directoryfiles,
            name: directoryName
          }
        }
      })
    }
  }, [files, send])

  useEffect(() => {
    setUploadStatuses(uploadStatuses => R.update(dirIndex, value, uploadStatuses))
  }, [dirIndex, setUploadStatuses, value])

  useEffect(() => {
    uploadDirectoryFiles()
  }, [uploadDirectoryFiles])

  const [ fileUploadStatus, fileUploadStatusColor, fileUploadStatusIcon ] = (
    R.isNil(files) ? ['Not Uploaded', 'grey', 'dont'] : // One or file was missing for this directory, so it is not being uploaded
    matches('inputPending') ? ['Pending Upload', 'grey', 'upload'] : // Waiting for input upload to begin
    matches('inputProcessing') ? ['Uploading', 'purple', 'circle notch'] : // The directory files are being uploaded
    matches('inputFailed') ? ['Upload Failed', 'red', 'times circle outline'] : // One of the directory files failed to upload
    ['Uploaded', 'green', 'circle check outline'] // The directory files were uploaded successfully
  )

  return (
    <Grid.Column>
      <Card fluid color={fileUploadStatusColor}>
        <Label color={fileUploadStatusColor} style={{ width: '100%' }}>
          <Header
            content={R.toUpper(`${dirName} — ${fileUploadStatus}`)}
            icon={<Icon loading={RA.isNotNil(files) && matches('inputProcessing')} name={fileUploadStatusIcon} />}
            size="small"
            style={{
              color: '#FFFFFF',
              wordBreak: 'break-word'
            }}
            textAlign="center"
          />
        </Label>
        <Card.Content>
          <List>
            {
              R.map(file => {
                const { expectedFileName, code } = R.prop(file, restDirSummary)
                const [fileValidColor, fileValidIcon] = R.prop(code, {
                  'valid': ['green', 'check circle'],
                  'missing': ['red', 'exclamation circle']
                })

                return (
                  <List.Item key={file}>
                    <List.Icon verticalAlign="middle" name={fileValidIcon} color={fileValidColor} />
                    <List.Content>
                      { expectedFileName } - <span style={{ color: fileValidColor }}>{ code }</span>
                    </List.Content>
                  </List.Item>
                )
              })(["matrix", "barcodes", "features"])
            }
          </List>
          { matches('inputFailed') && (
            <Button
              fluid
              color={fileUploadStatusColor}
              content="Retry Upload"
              icon="redo alternate"
              onClick={() => uploadDirectoryFiles()}
            />
          )}
        </Card.Content>
      </Card>
    </Grid.Column>
  )
}

// Callback function for drag and drop
const useOnDropAcceptedCallback = (setUploadErrMsgs, setUploadStatuses, setUploadSummary) => useCallback(acceptedFiles => {
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
        const nameEquals = filename => R.propEq('name', filename)
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
    const uploadSummary = uploadedDirs.reduce((uploadSummary, dir) => {
      const getCode = file => R.isNil(R.prop(file, dir)) ? "missing" : "valid"
      const dirSummary = {
        dirName: dir.directoryName,
        barcodes: { expectedFileName: "barcodes.tsv.gz", code: getCode("barcodes") },
        matrix: { expectedFileName: "matrix.mtx.gz", code: getCode("matrix") },
        features: { expectedFileName: "features.tsv.gz", code: getCode("features") }
      }
      // check if the code for all 3 files are "valid"
      const isValid = R.compose(
        R.all(R.equals("valid")),
        R.pluck("code"),
        R.props(['matrix', 'features', 'barcodes'])
      )(dirSummary)

      return R.append({
        ...dirSummary,
        files: isValid ? R.omit('directoryName', dir) : null
      }, uploadSummary)
    }, [])

    setUploadStatuses(R.repeat('inputPending', R.length(uploadSummary)))
    setUploadSummary(uploadSummary)

  } else {
    setUploadErrMsgs({ file: null, message: "Empty folder uploaded!" })
  }
}, [setUploadErrMsgs, setUploadStatuses, setUploadSummary])

const DirectoryUploadSegment = ({ newProjectState, newProjectDispatch }) => {
  const [uploadSummary, setUploadSummary] = useState([])
  const [uploadErrMsgs, setUploadErrMsgs] = useState([])
  const [uploadStatuses, setUploadStatuses] = useState([])

  // GQL mutation to create a dataset
  const [createDataset] = useMutation(gql`
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

  const { getRootProps, getInputProps } = useDropzone({
    accept: validFileTypes,
    maxSize: maxFileSize,
    onDrop: files => {
      if (R.isEmpty(files)) setUploadErrMsgs(null)
    },
    onDropAccepted: useOnDropAcceptedCallback(setUploadErrMsgs, setUploadStatuses, setUploadSummary),
    onDropRejected: errors => setUploadErrMsgs(errors.map(({ file, errors }) => ({ file, message: errorsToMsg(errors) })))
  })

  const getCountByUploadStatus = status => R.compose(R.length, R.filter(R.equals(status)))(uploadStatuses)
  const numUploading = getCountByUploadStatus('inputProcessing')
  const numUploaded = getCountByUploadStatus('inputReady')
  const numUploadFailed = getCountByUploadStatus('inputFailed')

  return (
    <>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <Segment placeholder>
          <Header textAlign="center">
            Drag and drop single-cell sample dataset directories or click to select directories
            {' '}
            <a
              href="https://pughlab.github.io/crescent-frontend/#item-2-1"
              onClick={e => e.stopPropagation()}
              target="_blank" 
              rel="noopener noreferrer"
            >(see required files and formats)</a>
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
      <Modal
        closeOnDimmerClick={R.any(R.includes(R.__, uploadStatuses), ['inputReady', 'inputFailed'])}
        size="small"
        onClose={() => {
          setUploadSummary([])
          setUploadErrMsgs([])
          setUploadStatuses([])
        }}
        open={R.any(RA.isNotEmpty, [uploadSummary, uploadErrMsgs])}
      >
        <Modal.Header>
          Upload Summary — { R.gt(R.length(uploadStatuses), 0) ? `${numUploaded}/${R.length(uploadStatuses)}` : 'None' } Uploaded
          {
            R.all(R.gt(R.__, 0), [numUploading, numUploadFailed]) ? ` (${numUploading} Uploading, ${numUploadFailed} Failed)` :
            R.gt(numUploading, 0) ? ` (${numUploading} Uploading)` :
            R.gt(numUploadFailed, 0) ? ` (${numUploadFailed} Failed)` :
            null
          }
        </Modal.Header>
        <Modal.Content scrolling>
          { R.isNil(uploadErrMsgs) ? (
            <Message error style={{ margin: 0 }}>
              Empty folder(s) uploaded!
            </Message>
          ) : (
            <>
              { RA.isNotEmpty(uploadErrMsgs) && (
                <Message error style={{ margin: 0 }}>
                  <Header>
                    Rejected files:
                  </Header>
                  <Message.List>
                    { uploadErrMsgs.map(({ file, message }, index) => (
                      <Message.Item key={index}>
                        { R.compose(R.join("/"), R.tail, R.split("/"))(file.path) }/<b>{ file.name }</b>: { message }
                      </Message.Item>
                    ))}
                  </Message.List>
                </Message>
              )}
              <Grid columns={2} style={{ margin: 0 }}>
                { uploadSummary.map((dirSummary, index) => (
                  <DirectoryStatusCard key={index} {...{ createDataset, dirIndex: index, dirSummary, setUploadStatuses }} />
                ))}
              </Grid>
            </>
          )}
        </Modal.Content>
        <Modal.Actions>
          <Button
            content={R.any(R.equals('inputProcessing'), uploadStatuses) ? 'Uploading, please wait a moment...' : 'Close'}
            disabled={R.any(R.equals('inputProcessing'), uploadStatuses)}
            onClick={() => {
              setUploadSummary([])
              setUploadErrMsgs([])
              setUploadStatuses([])
            }}
          />
        </Modal.Actions>
      </Modal>
    </>
  )
}

export default DirectoryUploadSegment