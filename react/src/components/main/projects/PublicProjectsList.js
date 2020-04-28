import React from 'react';

import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'

import { queryIsNotNil } from '../../../utils'

import { Card, Segment } from 'semantic-ui-react'

import withRedux from '../../../redux/hoc'

import ProjectCard from './ProjectCard'


const PublicProjectsList = withRedux(() => {
  // GQL query to find all public projects
  const { data } = useQuery(gql`
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
    <Segment>
    <Card.Group itemsPerRow={1}>
    {
      R.addIndex(R.map)(
        (project, index) => (
          <ProjectCard key={index} {...{project}} />
        ),
        curatedProjects
      )
    }
    </Card.Group>
    </Segment>
  )
})


export default PublicProjectsList