import React from 'react';

import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'

import { queryIsNotNil } from '../../../utils'

import { Card, Header, Icon, Segment } from 'semantic-ui-react'

import withRedux from '../../../redux/hoc'

import ProjectCard from './ProjectCard'
import NewProjectModal from './NewProjectModal'


const UploadedProjectsList = withRedux(({
  app: {
    user: {userID}
  },
}) => {
  // GQL query to find all projects of which user is a member of
  const { data, refetch } = useQuery(gql`
    query UserProjects($userID: ID) {
      projects(userID: $userID) {
        projectID
        name
        kind
        description
        externalUrls {
          label
          link
          type
        }
        createdOn
        createdBy {
          name
          userID
        }
        
        runs {
          runID
          name
          status
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
    <>
    <NewProjectModal {...{refetch}} />
    {
      R.isEmpty(userProjects) ?
        <Segment attached='bottom'>
          <Segment placeholder>
            <Header icon>
              <Icon name='exclamation' />
              No Projects
            </Header>
          </Segment>
        </Segment>
      :
        <Segment attached='bottom'>
          <Card.Group itemsPerRow={1}>
          {
            R.addIndex(R.map)(
              (project, index) => (
                <ProjectCard key={index} {...{project}} />
              ),
              userProjects
            )
          }
          </Card.Group>
        </Segment>
    }
    </>
  )
})


export default UploadedProjectsList