import React, {useState, useEffect} from 'react';

import { useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import moment from 'moment'

import {queryIsNotNil} from '../../../utils'


import {Form, Card, Header, Transition, Button, Container, Modal, Label, Divider, Icon, Image, Popup, Segment} from 'semantic-ui-react'

// import withRedux from '../../../redux/hoc'
import {useCrescentContext} from '../../../redux/hooks'

import ProjectCard from './ProjectCard'
import NewProjectModal from './NewProjectModal'


const UploadedProjectsList = ({
}) => {
  // GQL query to find all projects of which user is a member of
  const {userID} = useCrescentContext()
  const {loading, data, error, refetch} = useQuery(gql`
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

        mergedProjects {
          projectID
          name
        }
        uploadedDatasets {
          datasetID
          name
          size
        }

        datasetSize

        cancerTag
        oncotreeTissue {
          name
          code
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
    <>
    <NewProjectModal {...{refetch}} />
    <Divider horizontal />
    {
      R.isEmpty(userProjects) ?
        <Segment basic>
          <Segment placeholder>
            <Header icon>
              <Icon name='exclamation' />
              No Projects
            </Header>
          </Segment>
        </Segment>
      :
        <Card.Group itemsPerRow={3}>
        {
          R.addIndex(R.map)(
            (project, index) => (
              <ProjectCard key={index} {...{project}} />
            ),
            userProjects
          )
        }
        </Card.Group>
    }
    </>
  )
}


export default UploadedProjectsList