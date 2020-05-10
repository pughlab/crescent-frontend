import React, {useState, useEffect} from 'react';
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'


import {Header, Card, Segment, Icon, Transition} from 'semantic-ui-react'
import Fade from 'react-reveal/Fade'
import {ClimbingBoxLoader} from 'react-spinners'

import {useCuratedProjectsQuery} from '../../../apollo/hooks'

import ProjectCard from './ProjectCard'

const PublicProjectsList = () => {
  // GQL query to find all public projects
  const curatedProjects = useCuratedProjectsQuery()
  
  if (R.isNil(curatedProjects)) {
    return (
      <Fade>
      <Segment basic>
        <Segment placeholder>
          <Header textAlign='center' icon>
            <ClimbingBoxLoader />
          </Header>
        </Segment>
      </Segment>
      </Fade>
    )
  }
  return (
    R.isEmpty(curatedProjects) ?
      <Fade>
      <Segment basic>
        <Segment placeholder>
          <Header icon>
            <Icon name='exclamation' />
            No Projects
          </Header>
        </Segment>
      </Segment>
      </Fade>
    :
      <Card.Group itemsPerRow={3}>
      {
        R.addIndex(R.map)(
          (project, index) => (
            <ProjectCard key={index} {...{project}} />
          ),
          curatedProjects
        )
      }
      </Card.Group>
  )
}


export default PublicProjectsList