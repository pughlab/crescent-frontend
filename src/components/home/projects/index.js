


import React, {useState, useEffect} from 'react';

import { useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import moment from 'moment'

import {queryIsNotNil} from '../../../utils'


import {Form, Card, Header, Transition, Button, Container, Modal, Label, Divider, Icon, Image, Popup} from 'semantic-ui-react'

import withRedux from '../../../redux/hoc'

const UploadButton = ({
  label,   
  url, // Express url to upload temporary file
  setUploadedFile
}) => {
  const [localUploadedFile, setLocalUploadedFile] = useState(null)
  return (
  <>
    <Button fluid
      icon='upload'
      color={R.isNil(localUploadedFile) ? undefined : 'blue'}
      active={RA.isNotNil(localUploadedFile)}
      content={R.isNil(localUploadedFile) ? label : localUploadedFile.name}
      as={'label'}
      htmlFor={label}
    />
    <input hidden id={label} type='file'
      onChange={
        (event) => {
          const file = R.head(event.target.files)
          // Send file to minio
          const xhr = new XMLHttpRequest ()
          xhr.open('PUT', url, true)
          // xhr.setRequestHeader('Access-Control-Allow-Origin', '*') 
          xhr.withCredentials = true
          const formData = new FormData()
          formData.append('uploadedFile', file)
          xhr.send(formData)
          // xhr.onprogress = () => {}
          xhr.onload = () => {
            if (xhr.status == 200) {
              const uploadID = xhr.response
              setUploadedFile(uploadID)
              setLocalUploadedFile(file)
            }
          }
          // console.log(event.target.files)
        }
      }
    />
  </>
  )
}

const NewProjectCard = withRedux(({
  app: {user: {userID}},
  actions: {
    setProject
  }
}) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  // Minio object names for uploaded files in temporary bucket
  const [uploadedBarcodesFile, setUploadedBarcodesFile] = useState(null)    
  const [uploadedGenesFile, setUploadedGenesFile] = useState(null)    
  const [uploadedMatrixFile, setUploadedMatrixFile] = useState(null)
  console.log(uploadedBarcodesFile, uploadedGenesFile, uploadedMatrixFile)
  // GQL mutation to create a project
  const [createProject, {loading, data, error}] = useMutation(gql`
    mutation CreateProject(
      $userID: ID!,
      $name: String!,
      $description: String!,
      $barcodesObjectName: ID!,
      $genesObjectName: ID!,
      $matrixObjectName: ID!,
    ) {
      createProject(
        userID: $userID,
        name: $name,
        description: $description,
        barcodesObjectName: $barcodesObjectName,
        genesObjectName: $genesObjectName,
        matrixObjectName: $matrixObjectName,
      ) {
        projectID
        name
        description
        createdOn
        createdBy {
          name
        }
        runs {
          runID
          name
          params
        }
      }
    }
  `, {
    variables: {
      userID, name, description,
      barcodesObjectName: uploadedBarcodesFile,
      genesObjectName: uploadedGenesFile,
      matrixObjectName: uploadedMatrixFile,
    }
  })
  console.log('create project', data)
  const disableSubmit = R.any(RA.isNilOrEmpty)([
    name, description,
    uploadedBarcodesFile,
    uploadedGenesFile,
    uploadedMatrixFile
  ])
  console.log(disableSubmit)
  useEffect(() => {
    if (queryIsNotNil('createProject', data)) {
      const {createProject} = data
      console.log('query not nil', data)
      setProject(createProject)
    }
  }, [data])
  return (
    <Modal
      trigger={
        <Card link color='black'>
          <Card.Content>
            <Card.Header as={Header}>
              <Icon name='add' circular />
              <Header.Content>
                Create New Project
                <Header.Subheader content={'Upload your own files to create a new project'} />
              </Header.Content>
            </Card.Header>
          </Card.Content>
        </Card>
      }
    >
      <Modal.Header as={Header} textAlign='center' content='New Uploaded Project' />
      <Modal.Content>
        <Form>
          <Form.Input fluid
            placeholder='Enter a project name'
            onChange={(e, {value}) => {setName(value)}}
          />
          <Form.TextArea
            placeholder='Enter a short project description'
            onChange={(e, {value}) => {setDescription(value)}}
          />
          <Form.Group widths={3}>
            <Form.Field>
              <UploadButton label='Barcodes'
                url='/upload/barcodes'
                setUploadedFile={setUploadedBarcodesFile}
              />
            </Form.Field>
            <Form.Field>
              <UploadButton label='Genes/Features'
                url='/upload/genes' 
                setUploadedFile={setUploadedGenesFile}
              />
            </Form.Field>
            <Form.Field>
              <UploadButton label='Matrix'
                url='/upload/matrix' 
                setUploadedFile={setUploadedMatrixFile}
              />
            </Form.Field>
          </Form.Group>

          <Form.Button fluid
            content='Create new project'
            disabled={disableSubmit}
            onClick={() => createProject()}
          />
        </Form>
      </Modal.Content>
    </Modal>
  )
})

const ProjectCard = withRedux(({
  actions: {
    setProject
  },

  project
}) => {
  const {
    projectID,
    name,
    description,
    createdBy: {name: creatorName},
    createdOn
  } = project
  return (

    <Popup wide
      trigger={
        <Transition
          visible animation='zoom' duration={500} unmountOnHide={true} transitionOnMount={true}
        >
        <Card link onClick={() => setProject(project)}>
          <Card.Content>
              <Card.Header as={Header}>
                <Icon name='archive' circular />
                <Header.Content>
                  {name}
                  <Header.Subheader content={`Created by ${creatorName} on ${moment(createdOn).format('D MMMM YYYY')}`} />
                </Header.Content>
              </Card.Header>
          </Card.Content>
        </Card>
        </Transition>
      }
      content={description}
    />
  )
})

const ProjectsCardList = withRedux(({
  app: {
    // user: {projects: userProjects},
    user,
    toggle: {projects: {activeKind: activeProjectKind}}
  },
  actions: {
    toggle: {setActiveProjectKind}
  }
}) => {
  const projectKinds = [
    {key: 'published', label:'Published Data', description: 'Publicly available published datasets to visualize'},
    {key: 'example', label:'Example Data', description: 'Example data formats accepted by CReSCENT'},
    {key: 'uploaded', label:'Uploaded Data', description: 'Upload your own scRNA-seq data'},
  ]
  const isActiveProjectKind = R.equals(activeProjectKind)

  // GQL query to find all projects of which user is a member of
  const {loading, data, error} = useQuery(gql`
    query {
      curatedProjects {
        projectID
        name
        description
        createdOn
        createdBy {
          name
        }
      }
    }
  `, {
    fetchPolicy: 'cache-and-network'
  })
  const curatedProjects = R.ifElse(
      queryIsNotNil('curatedProjects'),
      R.prop('curatedProjects'),
      R.always([])
    )(data)
  const userProjects = R.ifElse(
    R.isNil,
    R.always([]),
    R.prop('projects')
  )(user)
  return (
    <Container>
      <Button.Group size='mini' fluid widths={3}>
        {
          R.map(
            ({key, label, description}) => (
              <Button key={key}
                content={
                  <Header content={label} subheader={description} />
                }
                disabled={R.and(R.isNil(user), R.equals(key, 'uploaded'))}
                active={isActiveProjectKind(key)}
                onClick={() => setActiveProjectKind(key)}
              />
            ),
            projectKinds
          )
        }
      </Button.Group>
      <Divider/>
      <Card.Group itemsPerRow={3} style={{maxHeight: '70vh', overflowY: 'scroll'}}>
      {
        isActiveProjectKind('uploaded') && <NewProjectCard />
      }
      {
        R.addIndex(R.map)(
          (project, index) => (
            <ProjectCard key={index} {...{project}} />
          ),
          isActiveProjectKind('uploaded') ?
            [...userProjects, ...userProjects]
          : isActiveProjectKind('published') ?
            curatedProjects
          : []
        )
      }
      </Card.Group>
    </Container>
  )
})


export default ProjectsCardList