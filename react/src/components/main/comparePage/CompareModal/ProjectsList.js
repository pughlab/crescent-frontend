import React from 'react';

import * as R from 'ramda'

import {Card, Header, Icon, Segment} from 'semantic-ui-react'
import Fade from 'react-reveal/Fade'
import {ClimbingBoxLoader} from 'react-spinners'
import ProjectCard from './ProjectCard'

import {useDispatch} from 'react-redux'
import {removePlots} from '../../../../redux/actions/comparePage';

const ProjectsList = ({
  projects,
  selectedProjectIDs, 
  setSelectedProjectIDs
}) => {
  const dispatch = useDispatch() 
  
  const onRemove = (currProjectID, project) => {
    // remove the selected plots of the project 
    const plotIDs = R.compose(
      R.reduce((IDs, run) =>  R.union(R.pluck('id', run.savedPlotQueries), IDs), []),
      R.prop('runs')
    )(project)
    dispatch(removePlots({value: plotIDs}))
    // return a function that remove the project ID from the list of IDs
    return R.filter(projectID => !R.equals(projectID, currProjectID))
  }

  if (R.isNil(projects)) {
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

  // a list of projects with no empty runs or plots
  const filteredProjects = R.compose(
    R.reduce(
      (nonEmptyProjects, project) => {
        const numPlots = R.reduce((number, run) => R.length(run.savedPlotQueries) + number, 0, project.runs)
        const nonEmptyRuns = R.filter(run => !R.isEmpty(run.savedPlotQueries), project.runs)
        return R.isEmpty(nonEmptyRuns) ? nonEmptyProjects : R.append({...project, numPlots, runs: nonEmptyRuns}, nonEmptyProjects)
    }, []),
    R.filter(project => !R.isEmpty(project.runs))
  )(projects)

  return (
    R.isEmpty(filteredProjects) ?
      <Fade up>
        <Segment basic>
          <Segment placeholder>
            <Header icon>
              <Icon name='exclamation' />
              <Header.Content>
                No Projects
              </Header.Content>
              <Header.Subheader>
                Only projects with at least one <a target="_blank" href='https://pughlab.github.io/crescent-frontend'>saved plot</a> will be shown here
              </Header.Subheader>
            </Header>
          </Segment>
        </Segment>
      </Fade>
    :
      <Card.Group itemsPerRow={3}>
      {
        R.compose(
          R.map((project) => 
            <ProjectCard {...{project}}
              key={project.projectID}  
              isSelected={R.includes(project.projectID, selectedProjectIDs)} 
              onClick = {(currProjectID) => 
                setSelectedProjectIDs(R.ifElse(
                  R.includes(currProjectID),
                  R.always(onRemove(currProjectID, project)),
                  R.append(currProjectID)
              )(selectedProjectIDs))}
          />)

        )(filteredProjects)
      }
      </Card.Group>
  )
}

export default ProjectsList