import React, {useState, useEffect} from 'react';

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {Form, Card, Header, Transition, Button, Container, Modal, Label, Divider, Icon, Image, Popup, Segment} from 'semantic-ui-react'

import {useUserProjectsQuery} from '../../../apollo/hooks'
import {useCrescentContext, useProjectsPage} from '../../../redux/hooks'

import ProjectCard from './ProjectCard'
import NewProjectModal from './NewProjectModal'

import Fade from 'react-reveal/Fade'
import {ClimbingBoxLoader} from 'react-spinners'

import Fuse from 'fuse.js'

const UploadedProjectsList = ({
}) => {
  const {searchFilter, tissueFilter, oncotreeFilter} = useProjectsPage()

  // GQL query to find all projects of which user is a member of
  const {userID} = useCrescentContext()
  const userProjects = useUserProjectsQuery(userID)
  if (R.isNil(userProjects)) {
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

  // Filtering
  const filterBySearchText = projects => {
    if (R.isEmpty(searchFilter)) {
      return projects
    } else {
      const fuse = new Fuse(projects, {keys: ['name', 'description']})
      return R.pluck('item', fuse.search(searchFilter))
    }
  }
  const projectHasCancerTissueFilter = project => {
    const {allDatasets} = project
    const {cancer, nonCancer} = tissueFilter
    const datasetHasCancerTissueFilter = ({cancerTag}) => R.or(
      R.and(cancer, cancerTag),
      R.and(nonCancer, R.not(cancerTag))
    )
    return R.any(datasetHasCancerTissueFilter, allDatasets)
  }
  const projectHasOncotreeFilter = project => {
    const {allDatasets} = project
    const datasetHasOncotreeCode = ({oncotreeCode}) => R.includes(oncotreeCode, oncotreeFilter)
    return R.or(
      R.isEmpty(oncotreeFilter),
      R.any(datasetHasOncotreeCode, allDatasets)
    )
  }
  const filteredProjects = R.compose(
    R.filter(projectHasOncotreeFilter),
    R.filter(projectHasCancerTissueFilter),
    filterBySearchText
  )(userProjects)

  return (
    <>
    
    <NewProjectModal />
    
    <Divider horizontal />
    {
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
            R.map(({projectID}) => <ProjectCard key={projectID} {...{projectID}} />)
          )(filteredProjects)
        }
        </Card.Group>
    }
    </>
  )
}


export default UploadedProjectsList