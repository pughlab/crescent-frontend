


import React, {useState, useEffect} from 'react';

import { useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import moment from 'moment'

import {queryIsNotNil} from '../../../utils'


import {Menu, Card, Header, Message, Button, Container, Modal, Label, Divider, Icon, Image} from 'semantic-ui-react'

import withRedux from '../../../redux/hoc'


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
    <Card link onClick={() => setProject(project)}>
      <Card.Content>
        <Card.Header content={name} />
        <Card.Meta content={`Created by ${creatorName} on ${moment(createdOn).format('D MMMM YYYY')}`} />
      </Card.Content>
      <Card.Content extra content={description} />
    </Card>
  )
})

const ProjectsCardList = withRedux(({
  app: {
    user: {projects: userProjects}
  }
}) => {
  const projectTypes = [
    {key: 'uploaded', label:'Uploaded Data'},
    {key: 'example', label:'Example Data'},
    {key: 'published', label:'Published Data'}
  ]
  const [projectType, setProjectType] = useState(null) // 'uploaded' || 'public' || 'published'
  const isActiveProjectType = R.equals(projectType)

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
  return (
    <Container>
      <Header textAlign='center' content='Projects' />
      <Divider />
        <Button.Group fluid widths={3} attached='top'>
          {
            R.map(
              ({key, label}) => (
                <Button key={key}
                  content={label}
                  active={isActiveProjectType(key)}
                  onClick={() => setProjectType(key)}
                />
              ),
              projectTypes
            )
          }
        </Button.Group>
        <Message attached='bottom'>
          <Header>
            <Header.Content content='Click above to select a project type or below to create a new project' />
          </Header>
          <Message.List>
            <Message.Item content='Your Data: Upload your own scRNA-seq data for analysis and visualization' />
            <Message.Item content='Example Data: Examples of data formats accepted by CReSCENT' />
            <Message.Item content='Published Data: Select published, publicly available datasets to visualize' />
          </Message.List>
        </Message>
      <Divider />
      <Card.Group itemsPerRow={3}>
      {
        R.map(
          project => <ProjectCard key={R.prop('projectID', project)} {...{project}} />,
          isActiveProjectType('uploaded') ?
            userProjects
          : isActiveProjectType('published') ?
            curatedProjects
          : []
        )
      }
      </Card.Group>
    </Container>
  )
})


export default ProjectsCardList