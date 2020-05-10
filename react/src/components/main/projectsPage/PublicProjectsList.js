import React, {useState, useEffect} from 'react';
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'


import {Header, Card, Segment, Icon, Transition} from 'semantic-ui-react'
import Fade from 'react-reveal/Fade'
import {ClimbingBoxLoader} from 'react-spinners'

import Fuse from 'fuse.js'

import {useCuratedProjectsQuery} from '../../../apollo/hooks'
import {useProjectsPage} from '../../../redux/hooks'

import ProjectCard from './ProjectCard'

const PublicProjectsList = () => {
  const {searchFilter} = useProjectsPage()

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

  const filterBySearchText = projects => {
    if (R.isEmpty(searchFilter)) {
      return projects
    } else {
      const fuse = new Fuse(projects, {keys: ['name', 'description']})
      return R.pluck('item', fuse.search(searchFilter))
    }
  }
  const filteredProjects = R.compose(
    filterBySearchText
  )(curatedProjects)
  
  return (
    R.isEmpty(filteredProjects) ?
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
        R.compose(
          R.addIndex(R.map)((project, index) => <ProjectCard key={index} {...{project}} />)
        )(filteredProjects)
      }
      </Card.Group>
  )
}


export default PublicProjectsList