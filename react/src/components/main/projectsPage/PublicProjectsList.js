import React, {useState, useEffect} from 'react';

import { useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import moment from 'moment'

import {queryIsNotNil} from '../../../utils'


import {Header, Card, Segment, Icon, Transition} from 'semantic-ui-react'


// import ProjectCard from './ProjectCard'


const PublicProjectsList = () => {
  // GQL query to find all public projects
  const {loading, data, error} = useQuery(gql`
    query {
      curatedProjects {
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
    fetchPolicy: 'cache-and-network'
  })
  const curatedProjects = R.ifElse(
      queryIsNotNil('curatedProjects'),
      R.prop('curatedProjects'),
      R.always([])
    )(data)
  return (
    R.isEmpty(curatedProjects) ?
      <Transition visible animation='fade up' duration={500} unmountOnHide={true} transitionOnMount={true}>
      <Segment basic>
        <Segment placeholder>
          <Header icon>
            <Icon name='exclamation' />
            No Projects
          </Header>
        </Segment>
      </Segment>
      </Transition>
    :
      <Card.Group itemsPerRow={3}>
      {
        R.addIndex(R.map)(
          (project, index) => (
            `${index}`
            // <ProjectCard key={index} {...{project}} />
          ),
          curatedProjects
        )
      }
      </Card.Group>
  )
}


export default PublicProjectsList