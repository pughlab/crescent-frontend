import React, {useState, useEffect} from 'react';
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'


import {Header, Card, Segment, Icon, Transition} from 'semantic-ui-react'
import Fade from 'react-reveal/Fade'
import {ClimbingBoxLoader} from 'react-spinners'

import Fuse from 'fuse.js'

import {useCuratedProjectsQuery} from '../../../apollo/hooks/project'
import {useProjectsPage} from '../../../redux/hooks'

import ProjectCard from './ProjectCard'

const PublicProjectsList = () => {
  const {searchFilter, tissueFilter, oncotreeFilter} = useProjectsPage()

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
  const projectHasCancerTissueFilter = project => {
    const {allDatasets} = project
    const {cancer, nonCancer} = tissueFilter
    const datasetHasCancerTissueFilter = ({cancerTag}) => R.or(
      R.and(cancer, R.equals(cancerTag, 'cancer')),
      R.and(nonCancer, R.complement(R.equals)(cancerTag, 'cancer'))
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
  )(curatedProjects)
  
  return (
    R.isEmpty(filteredProjects) ?
      <Fade up>
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
          R.map(({projectID}) => <ProjectCard key={projectID} {...{projectID}} />),
          R.sortBy(R.prop('accession'))
        )(filteredProjects)
      }
      </Card.Group>
  )
}


export default PublicProjectsList