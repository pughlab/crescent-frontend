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

import DirectoryUploadSegment from './DirectoryUploadSegment'
import CreateProjectButton from './CreateProjectButton'
import ExistingDatasets from './ExistingDatasets'

// const DatasetCard = ({
//   dataset
// }) => {
//   // Get directory name from matrix file
//   const dirName = R.compose(
//     R.prop(1),
//     R.split('/'),
//     R.prop('path'),
//     R.prop('matrix')
//   )(dataset)

//   const hasMetadata = R.compose(
//     RA.isNotNil,
//     R.prop('metadata')
//   )(dataset)

//   return (
//     <Card>
//       <Card.Content>
//         <Card.Header as={Header} sub content={dirName} />
//       </Card.Content>
//       <Card.Content>
//         <Label content='Metadata' detail={hasMetadata ? 'Yes' : 'No'} />
//       </Card.Content>
//     </Card>
//   )
// }

// const DirectoryUploadSegment = ({
//   datasetDirectories, setDatasetDirectories
// }) => {
//   const emptyDatasetDir = {
//     matrix: null,
//     features: null,
//     barcodes: null,
//     metadata: null
//   }
//   const [datasetDir, setDatasetDir] = useState(emptyDatasetDir)
//   const isValidDatasetDir = R.compose(
//     R.all(RA.isNotNil),
//     R.props(['matrix', 'features', 'barcodes'])
//   )
//   const onDrop = useCallback(acceptedFiles => {
//     console.log(acceptedFiles)


//     // Check that directory has expected files
//     const uploadedDatasetDir = R.reduce(
//       (dataset, file) => {
//         const nameEquals = filename => R.compose(R.equals(filename), R.prop('name'))
//         const addToDataset = R.assoc(R.__, R.__, dataset)
//         return R.cond([
//           [nameEquals('matrix.mtx.gz'), addToDataset('matrix')],
//           [nameEquals('barcodes.tsv.gz'), addToDataset('barcodes')],
//           [nameEquals('features.tsv.gz'), addToDataset('features')],
//           [nameEquals('metadata.tsv'), addToDataset('metadata')],
//           [R.T, R.always(dataset)]
//         ])(file)
//       },
//       {matrix: null, features: null, barcodes: null, metadata: null},
//       acceptedFiles
//     )
//     if (isValidDatasetDir(uploadedDatasetDir)) {
//       setDatasetDir(uploadedDatasetDir)
//     }
//   }, [])

//   useEffect(() => {
//     if (isValidDatasetDir(datasetDir)) {
//       setDatasetDirectories(R.append(datasetDir, datasetDirectories))
//     }
//   }, [datasetDir])
//   const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})
//   return (
//     <div {...getRootProps()}>
//     <Segment placeholder>
//       <Header textAlign='center' content='Drag and drop single-cell sample dataset directory' />
//       <Card.Group itemsPerRow={4}>
//       {
//         R.addIndex(R.map)(
//           (dataset, index) => <DatasetCard {...{dataset}} key={index} />,
//           datasetDirectories
//         )
//       }
//       </Card.Group>
//     </Segment>
//     </div>
//   )
// }

const NewProjectModal = withRedux(({
  app: {user: {userID}},
  actions: {
    setProject
  },

  refetch
}) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [datasetDirectories, setDatasetDirectories] = useState([])
  const [existingDatasets, setExistingDatasets] = useState([])
  const resetNewProjectModal = () => {
    setName('')
    setDescription('')
    setDatasetDirectories([])
    setExistingDatasets([])
  }
  // Minio object names for uploaded files in temporary bucket
  // const [uploadedBarcodesFile, setUploadedBarcodesFile] = useState(null)    
  // const [uploadedGenesFile, setUploadedGenesFile] = useState(null)    
  // const [uploadedMatrixFile, setUploadedMatrixFile] = useState(null)
  // GQL mutation to create a project
  // const [createProject, {loading, data, error}] = useMutation(gql`
  //   mutation CreateProject(
  //     $userID: ID!,
  //     $name: String!,
  //     $description: String!,
  //     $barcodesObjectName: ID!,
  //     $genesObjectName: ID!,
  //     $matrixObjectName: ID!,
  //   ) {
  //     createProject(
  //       userID: $userID,
  //       name: $name,
  //       description: $description,
  //       barcodesObjectName: $barcodesObjectName,
  //       genesObjectName: $genesObjectName,
  //       matrixObjectName: $matrixObjectName,
  //     ) {
  //       projectID
  //       name
  //       kind
  //       description
  //       createdOn
  //       createdBy {
  //         name
  //         userID
  //       }
        
  //       runs {
  //         runID
  //         name
  //         status
  //       }

  //       datasetSize
  //     }
  //   }
  // `, {
  //   variables: {
  //     userID, name, description,
  //     barcodesObjectName: uploadedBarcodesFile,
  //     genesObjectName: uploadedGenesFile,
  //     matrixObjectName: uploadedMatrixFile,
  //   },
  //   onCompleted: ({createProject: newProject}) => {
  //     if (RA.isNotNil(newProject)) {
  //       // Should call refetch before setting to new project
  //       refetch()
  //       setProject(newProject)
  //     }
  //   }
  // })
  // const disableSubmit = R.any(RA.isNilOrEmpty)([
  //   name, description,
  //   uploadedBarcodesFile,
  //   uploadedGenesFile,
  //   uploadedMatrixFile
  // ])
  const [currentContent, setCurrentContent] = useState('details')
  const CONTENTS = [
    {
      name: 'details',
      label: 'Details',
      icon: 'info',
      component: (
        <Segment basic>
          <Form>
            <Form.Input fluid
              placeholder='Enter a project name'
              value={name}
              onChange={(e, {value}) => {setName(value)}}
            />
            <Form.TextArea
              placeholder='Enter a short project description'
              value={description}
              onChange={(e, {value}) => {setDescription(value)}}
            />
          </Form>
        </Segment>
      )
    },
    {
      name: 'existing',
      label: 'Existing Projects',
      icon: 'folder open',
      component: (
        <Segment basic>
          <ExistingDatasets {...{existingDatasets, setExistingDatasets}} />
        </Segment>
      )
    },
    {
      name: 'upload',
      label: 'Upload Dataset(s)',
      icon: 'cloud upload',
      component: (
        <Segment basic>
          <DirectoryUploadSegment {...{datasetDirectories, setDatasetDirectories}} />
        </Segment>
      )
    },
    {
      name: 'submit',
      label: 'Create Project',
      icon: 'paper plane',
      component: (
        <Segment basic>
          <CreateProjectButton
            {...{
              name, setName,
              description, setDescription,
              datasetDirectories, setDatasetDirectories,
              existingDatasets, setExistingDatasets,
            }}
          />
        </Segment>
      )
    },

  ]
  return (
    <Modal
      size='large'
      onOpen={() => resetNewProjectModal()}
      trigger={
        <Button fluid size='large'
          color='black'
          animated='vertical'
        >
          <Button.Content visible><Icon name='add' size='large'/></Button.Content>
          <Button.Content hidden content="Upload your own files to create a new project"/>
        </Button>
      }
    >
      <Modal.Header as={Header} textAlign='center' content='New Project' />
      <Modal.Header>
        <Step.Group fluid size='small' widths={4}>
        {
          R.map(
            ({name, label, icon}) => (
              <Step key={name} title={label} onClick={() => setCurrentContent(name)} icon={icon}
                active={R.equals(currentContent, name)}
              />
            ),
            CONTENTS
          )
        }
        </Step.Group>
      </Modal.Header>
      <Modal.Content scrolling>
      {
        R.compose(
          R.prop('component'),
          R.find(R.propEq('name', currentContent))
        )(CONTENTS)
      }
      </Modal.Content>
    </Modal>
  )
})

export default NewProjectModal