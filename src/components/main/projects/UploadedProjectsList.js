


import React, {useState, useEffect} from 'react';

import { useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import moment from 'moment'

import {queryIsNotNil} from '../../../utils'


import {Form, Card, Header, Transition, Button, Container, Modal, Label, Divider, Icon, Image, Popup} from 'semantic-ui-react'

import withRedux from '../../../redux/hoc'

import ProjectCard from './ProjectCard'
import NewProjectCard from './NewProjectCard'


const UploadedProjectsList = withRedux(({
  app: {
    user: {userID}
  },
}) => {
  // GQL query to find all projects of which user is a member of
  const {loading, data, error, refetch} = useQuery(gql`
    query UserProjects($userID: ID) {
      projects(userID: $userID) {
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
    fetchPolicy: 'network-only',
    variables: {userID}
  })
  const userProjects = R.ifElse(
    queryIsNotNil('projects'),
    R.prop('projects'),
    R.always([])
  )(data)
  console.log(data)
  return (
    <Card.Group itemsPerRow={3} style={{maxHeight: '65vh', overflowY: 'scroll'}}>
      <NewProjectCard {...{refetch}} />
    {
      R.addIndex(R.map)(
        (project, index) => (
          <ProjectCard key={index} {...{project}} />
        ),
        userProjects
      )
    }
    </Card.Group>
  )
})


export default UploadedProjectsList