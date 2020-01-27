


import React, {useState, useCallback, useEffect} from 'react';

import { useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import moment from 'moment'

import {queryIsNotNil} from '../../../../utils'

import {useDropzone} from 'react-dropzone'

import {Form, Card, Header, Menu, Button, Transition, Modal, Label, Divider, Icon, Image, Popup, Grid, Step} from 'semantic-ui-react'

import withRedux from '../../../../redux/hoc'

import filesize from 'filesize'
import Marquee from 'react-marquee'



const ProjectCard = ({
  project: {
    projectID,
    name,
    createdOn,
    createdBy: {name: creatorName},
    datasetSize
  },
  existingDatasets, setExistingDatasets
}) => {

  const addOrRemoveExistingDatasets = projectID => {
    if (R.includes(projectID, existingDatasets)) {
      setExistingDatasets(R.without([projectID], existingDatasets))
    } else {
      setExistingDatasets(R.append(projectID, existingDatasets))
    }
  }
  
  const clicked = R.includes(projectID, existingDatasets)

  console.log(existingDatasets)
  return (
    <Transition visible animation='fade up' duration={1000} unmountOnHide={true} transitionOnMount={true}>
    <Card link onClick={() => addOrRemoveExistingDatasets(projectID)} color={clicked ? 'blue' : 'grey'}>
    <Popup
        size='large' wide='very'
        inverted
        trigger={
          <Button attached='top' color={clicked ? 'blue' : 'grey'}>
            <Icon name={clicked ? 'folder open' : 'folder outline open'} size='large' />
          </Button>
        }
        content={'Click to merge into your project'}
      />
    <Card.Content extra>
      <Header size='small'>
        <Header.Content>
        {name}
        </Header.Content>
      </Header>
    </Card.Content>
    <Card.Content>
      <Label.Group>
        <Label content={<Icon style={{margin: 0}} name='user' />} detail={creatorName} />
        <Label content={<Icon style={{margin: 0}} name='calendar alternate outline' />} detail={moment(createdOn).format('DD MMM YYYY')} />
        <Label content={<Icon style={{margin: 0}} name='file archive' />} detail={'#'} />
        <Label content={<Icon style={{margin: 0}} name='save' />} detail={filesize(datasetSize)} />
      </Label.Group>
    </Card.Content>
    </Card>
    </Transition>
  )
}

const PublicDatasets = ({
  existingDatasets, setExistingDatasets
}) => {
  // GQL query to find all public projects
  const {loading, data, error} = useQuery(gql`
    query {
      curatedProjects {
        projectID
        name
        kind
        createdOn
        createdBy {
          name
          userID
        }
        datasetSize
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

  return (
    <Card.Group itemsPerRow={3}>
    {
      R.addIndex(R.map)(
        (project, index) => <ProjectCard key={index} {...{project, existingDatasets, setExistingDatasets}} />,
        curatedProjects
      )
    }
    </Card.Group>
  )
}

const UploadedDatasets = withRedux(({
  app: {
    user: {userID}
  },
  existingDatasets, setExistingDatasets
}) => {
  // GQL query to find all projects of which user is a member of
  const {loading, data, error, refetch} = useQuery(gql`
    query UserProjects($userID: ID) {
      projects(userID: $userID) {
        projectID
        name
        createdOn
        createdBy {
          name
          userID
        }
        datasetSize
      }
    }
  `, {
    fetchPolicy: 'network-only',
    variables: {userID}
  })
  const userProjects = R.ifElse(
    queryIsNotNil('projects'),
    R.prop('projects'),
    R.always([])
  )(data)
  return (
    <Card.Group itemsPerRow={3}>
    {
      R.addIndex(R.map)(
        (project, index) => <ProjectCard key={index} {...{project, existingDatasets, setExistingDatasets}} />,
        userProjects
      )
    }
    </Card.Group>
  )
})

const ExistingDatasets = ({
  existingDatasets, setExistingDatasets
}) => {
  const [projectKind, setProjectKind] = useState('published')
  const isProjectKind = R.equals(projectKind)

  return (
    <>
      <Button.Group fluid widths={2}>
        <Button color='black'
          onClick={() => setProjectKind('published')}
          active={isProjectKind('published')} 
          basic={R.not(isProjectKind('published'))}
        >
          Public Data
        </Button>
        <Button color='black'
          onClick={() => setProjectKind('uploaded')}
          active={isProjectKind('uploaded')} 
          basic={R.not(isProjectKind('uploaded'))}
        >
          Uploaded Data
        </Button>
      </Button.Group>
      <Divider horizontal />
      {
        isProjectKind('published') ? 
          <PublicDatasets {...{existingDatasets, setExistingDatasets}} />
        :
          <UploadedDatasets {...{existingDatasets, setExistingDatasets}} />
      }
    </>
  )
}

export default ExistingDatasets