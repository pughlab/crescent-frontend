


import React, {useState, useEffect} from 'react';

import { useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import moment from 'moment'

import {queryIsNotNil} from '../../../utils'


import {Form, Card, Segment, Transition, Button, Container, Modal, Label, Divider, Icon, Image, Popup} from 'semantic-ui-react'

import withRedux from '../../../redux/hoc'

import ProjectCard from './ProjectCard'


const PublicProjectsList = withRedux(({
}) => {
  // GQL query to find all public projects
  const {loading, data, error} = useQuery(gql`
    query {
      curatedProjects {
        projectID
        name
        kind
        description
        createdOn
        createdBy {
          name
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