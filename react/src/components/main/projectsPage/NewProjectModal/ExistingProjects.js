


import React, {useState, useCallback, useEffect} from 'react';

import { useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import moment from 'moment'

import {queryIsNotNil} from '../../../../utils'

import {useDropzone} from 'react-dropzone'

import {Form, Card, Header, Menu, Button, Message, Transition, Modal, Label, Divider, Icon, Image, Popup, Grid, Step, Segment} from 'semantic-ui-react'


import filesize from 'filesize'
import Marquee from 'react-marquee'

import {useCrescentContext} from '../../../../redux/hooks'

export const DatasetsPopoverContent = ({
  allDatasets
}) => {
  return (
    <Message>
      <Message.Content>
      <Divider horizontal content='Datasets' />
        <Label.Group>
        {
          R.map(
            ({datasetID, name}) => (
              <Label key={datasetID}>
                {name}
              </Label>
            ),
            allDatasets
          )
        }
        </Label.Group>
      </Message.Content>
    </Message>
  )
}

const ProjectCard = ({
  project: {
    projectID,
    name,
    createdOn,
    createdBy: {name: creatorName},
    allDatasets
  },
  newProjectState, newProjectDispatch
}) => {  
  const isSelectedForMerge = R.compose(
    R.includes(projectID),
    R.prop('mergedProjectIDs')
  )(newProjectState)

  const uniqueOncotreeCodesArray = R.compose(R.uniq, R.reject(R.isNil), R.pluck('oncotreeCode'))(allDatasets)

  return (
    <Transition visible animation='fade up' duration={1000} unmountOnHide={true} transitionOnMount={true}>
    <Card link
      color={isSelectedForMerge ? 'blue' : 'grey'}
      onClick={() => newProjectDispatch({type: 'TOGGLE_PROJECT', projectID})}
    >
    <Popup
        size='large' wide='very'
        trigger={
          <Button attached='top' color={isSelectedForMerge ? 'blue' : 'grey'}>
            <Icon name={isSelectedForMerge ? 'folder open' : 'folder outline'} size='large' />
          </Button>
        }        
      >
        <DatasetsPopoverContent {...{allDatasets}} />
      </Popup>
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
        <Label content={<Icon style={{margin: 0}} name='upload' />} detail={`${R.length(allDatasets)} dataset(s)`} />
        {
          R.map(
            oncotreeCode => <Label key={oncotreeCode} content={<Icon style={{margin: 0}} name='paperclip' />} detail={oncotreeCode} />,
            uniqueOncotreeCodesArray
            )
        }
      </Label.Group>
    </Card.Content>
    </Card>
    </Transition>
  )
}

const PublicProjects = ({
  newProjectState, newProjectDispatch
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
        allDatasets {
          datasetID
          name
          oncotreeCode
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

  return (
    R.isEmpty(curatedProjects) ? 
    <Segment placeholder>
      <Header icon>
        <Icon name='exclamation' />
        No Projects
      </Header>
    </Segment>
    :
    <Card.Group itemsPerRow={3}>
    {
      R.addIndex(R.map)(
        (project, index) => <ProjectCard key={index} {...{project, newProjectState, newProjectDispatch}} />,
        curatedProjects
      )
    }
    </Card.Group>
  )
}

const UploadedProjects = ({
  newProjectState, newProjectDispatch
}) => {
  const {userID} = useCrescentContext()
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
        allDatasets {
          datasetID
          name
          oncotreeCode
        }
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
    R.isEmpty(userProjects) ?
    <Segment placeholder>
      <Header icon>
        <Icon name='exclamation' />
        No Projects
      </Header>
    </Segment>
    :
    <Card.Group itemsPerRow={3}>
    {
      R.addIndex(R.map)(
        (project, index) => <ProjectCard key={index} {...{project, newProjectState, newProjectDispatch}} />,
        userProjects
      )
    }
    </Card.Group>
  )
}

export {PublicProjects, UploadedProjects}