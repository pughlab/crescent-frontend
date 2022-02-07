import React, { useCallback, useState } from 'react'
import { Button, Card, Grid, Header, Icon, Label, List, Message, Modal, Segment } from 'semantic-ui-react'
import { useDropzone } from 'react-dropzone'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { useDeleteDatasetMutation, useEditDatasetTagsMutation, useOncotreeQuery } from '../../../../apollo/hooks/dataset'

import { TagOncotreeModalContent } from '../../runsPage/UploadedDatasetsDetails/index'
import { useMachineServices } from '../../../../redux/hooks'
import { useActor } from '@xstate/react'
import { useNewProjectEvents } from '../../../../xstate/hooks'

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

const DatasetCard = ({ datasetID }) => {
  const deleteDataset = useDeleteDatasetMutation(datasetID)
  const { dataset, tagDataset, addCustomTagDataset, removeCustomTagDataset } = useEditDatasetTagsMutation(datasetID)

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
  dirIndex,
  dirSummary: {
    dirName,
    files,
    ...restDirSummary
  }
}) => {
  const { newProjectService } = useMachineServices()
  const [{ context: { datasetUploadStatuses }}] = useActor(newProjectService)
  const {retryUploadDataset} = useNewProjectEvents()
  
  const isDatasetUploadStatus = status => R.compose(
    R.equals(status),
    R.nth(dirIndex)
  )(datasetUploadStatuses)

  const [ fileUploadStatus, fileUploadStatusColor, fileUploadStatusIcon ] = (
    R.isNil(files) ? ['Not Uploaded', 'grey', 'dont'] : // One or file was missing for this directory, so it is not being uploaded
    isDatasetUploadStatus('pending') ? ['Pending Upload', 'grey', 'upload'] : // Waiting for input upload to begin
    isDatasetUploadStatus('loading') ? ['Uploading', 'purple', 'circle notch'] : // The directory files are being uploaded
    isDatasetUploadStatus('failed') ? ['Upload Failed', 'red', 'times circle outline'] : // One of the directory files failed to upload
    ['Uploaded', 'green', 'circle check outline'] // The directory files were uploaded successfully
  )

  return (
    <Grid.Column>
      <Card fluid color={fileUploadStatusColor}>
        <Label color={fileUploadStatusColor} style={{ width: '100%' }}>
          <Header
            content={R.toUpper(`${dirName} — ${fileUploadStatus}`)}
            icon={<Icon loading={RA.isNotNil(files) && isDatasetUploadStatus('loading')} name={fileUploadStatusIcon} />}
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
          { isDatasetUploadStatus('failed') && (
            <Button
              fluid
              color={fileUploadStatusColor}
              content="Retry Upload"
              icon="redo alternate"
              onClick={() => {
                const { directoryName, ...directoryfiles } = files

                retryUploadDataset({
                  dataset: {
                    variables: {
                      ...directoryfiles,
                      name: dirName
                    }
                  },
                  datasetIndex: dirIndex
                })
              }}
            />
          )}
        </Card.Content>
      </Card>
    </Grid.Column>
  )
}

// Callback function for drag and drop
const useOnDropAcceptedCallback = (setUploadErrMsgs, setUploadSummary, uploadDatasets) => useCallback(acceptedFiles => {
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
        dirName: R.compose(R.equals('undefined'), R.prop('directoryName'))(dir) ? "root" : dir.directoryName,
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

    setUploadSummary(uploadSummary)
    uploadDatasets({
      datasets: R.compose(
        R.map(
          ({ dirName, files }) => ({
            variables: {
              ...files,
              name: dirName
            }
          })
        ),
        R.reject(R.propEq('files', null))
      )(uploadSummary)
    })
  } else {
    setUploadErrMsgs({ file: null, message: "Empty folder uploaded!" })
  }
}, [setUploadErrMsgs, setUploadSummary, uploadDatasets])

const DirectoryUploadSegment = () => {
  const [uploadSummary, setUploadSummary] = useState([])
  const [uploadErrMsgs, setUploadErrMsgs] = useState([])

  const [validDirs, invalidDirs] = R.partition(R.compose(RA.isNotNil, R.prop('files')))(uploadSummary)

  const { newProjectService } = useMachineServices()
  const [{ context: { datasetUploadStatuses, uploadedDatasetIDs } }] = useActor(newProjectService)
  const { uploadDatasets } = useNewProjectEvents()

  const { getRootProps, getInputProps } = useDropzone({
    accept: validFileTypes,
    maxSize: maxFileSize,
    onDrop: files => {
      if (R.isEmpty(files)) setUploadErrMsgs(null)
    },
    onDropAccepted: useOnDropAcceptedCallback(setUploadErrMsgs, setUploadSummary, uploadDatasets),
    onDropRejected: errors => setUploadErrMsgs(errors.map(({ file, errors }) => ({ file, message: errorsToMsg(errors) })))
  })

  const getCountByUploadStatus = status => R.compose(R.length, R.filter(R.equals(status)))(datasetUploadStatuses)
  const numUploading = getCountByUploadStatus('loading')
  const numUploaded = getCountByUploadStatus('success')
  const numUploadFailed = getCountByUploadStatus('failed')

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
          { RA.lengthGt(0, uploadedDatasetIDs) && (
            <Card.Group itemsPerRow={4}>
              {
                R.map(
                  datasetID => <DatasetCard key={datasetID} {...{ datasetID }} />,
                  uploadedDatasetIDs
                )
              }
            </Card.Group>
          )}
        </Segment>
      </div>
      <Modal
        closeOnDimmerClick={R.any(R.includes(R.__, datasetUploadStatuses), ['success', 'failed'])}
        size="small"
        onClose={() => {
          setUploadSummary([])
          setUploadErrMsgs([])
        }}
        open={R.any(RA.isNotEmpty, [uploadSummary, uploadErrMsgs])}
      >
        <Modal.Header>
          Upload Summary — { RA.lengthGt(0, datasetUploadStatuses) ? `${numUploaded}/${R.length(datasetUploadStatuses)}` : 'None' } Uploaded
          {
            R.all(RA.lengthGt(0), [numUploading, numUploadFailed]) ? ` (${numUploading} Uploading, ${numUploadFailed} Failed)` :
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
                {
                  R.addIndex(R.map)((dirSummary, index) => (
                    <DirectoryStatusCard key={index} {...{ dirIndex: index, dirSummary }} />
                  ))(validDirs)
                }
              </Grid>
              { RA.lengthGt(0, invalidDirs) && (
                <>
                  <Header content={`Directories with File(s) Missing (${R.compose(R.length, R.filter(R.compose(R.isNil, R.prop('files'))))((uploadSummary))})`} />
                  <Grid columns={2} style={{ margin: 0 }}>
                    {
                      R.addIndex(R.map)((dirSummary, index) => (
                        <DirectoryStatusCard key={index} {...{ dirIndex: index, dirSummary }} />
                      ))(invalidDirs)
                    }
                  </Grid>
                </>
              )}
            </>
          )}
        </Modal.Content>
        <Modal.Actions>
          <Button
            content={R.any(R.equals('loading'), datasetUploadStatuses) ? 'Uploading, please wait a moment...' : 'Close'}
            disabled={R.any(R.equals('loading'), datasetUploadStatuses)}
            onClick={() => {
              setUploadSummary([])
              setUploadErrMsgs([])
            }}
          />
        </Modal.Actions>
      </Modal>
    </>
  )
}

export default DirectoryUploadSegment