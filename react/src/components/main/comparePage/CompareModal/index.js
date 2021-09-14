import React, {useState} from 'react';
import * as R from 'ramda'

import {Header, Button, Segment, Modal, Icon, Card, Popup, Step, Transition} from 'semantic-ui-react'
import PlotCard from './PlotCard'
import ProjectsForm from './ProjectsForm'

import {useDispatch} from 'react-redux'
import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'
import {clearPlots} from '../../../../redux/actions/resultsPage'
import {goToCompare} from '../../../../redux/actions/context'

import {useUserPlotsQuery} from '../../../../apollo/hooks/user'
import {useCuratedProjectPlotsQuery} from '../../../../apollo/hooks/project'

const CompareModal = ({
}) => {
  const dispatch = useDispatch()
  const {userID, projectID} = useCrescentContext()
  const {plotQueries} = useResultsPage()

  const uploadedProjects = useUserPlotsQuery(userID)  
  const curatedProjects = useCuratedProjectPlotsQuery()

  const [open, setOpen] = useState(false)
  const [selectedProjectIDs, setSelectedProjectIDs] = useState(projectID ? [projectID] : [])
  const [currentContent, setCurrentContent] = useState(projectID ? 'plots' : 'projects')

  const onClose = () => {
    setSelectedProjectIDs(projectID ? [projectID] : [])
    dispatch(clearPlots())
    setCurrentContent(projectID ? 'plots' : 'projects')
    setOpen(false)
  }

  // a list of plots of selected projects with its project and run details
  const plots = R.compose(
    // get all the plots and add project and runs details to each plot
    R.reduce(
      (detailedPlots, {savedPlotQueries, name, runID, projectID, projectName, allDatasets, createdOn, createdBy: {name: ownerName}}) => 
			R.concat(
        detailedPlots, 
        R.map(plotQuery => ({query: plotQuery, projectID, projectName, runName: name, runID, allDatasets, createdOn, ownerName}), savedPlotQueries)
    ), []),
    // get all the runs and add project details to each run
    R.reduce(
      (detailedRuns, {runs, projectID, name, allDatasets}) =>  
        R.concat(detailedRuns, R.map((run) => ({...run, projectName: name, projectID, allDatasets}), runs)),
		[]),
    // filter out unselected projects
    R.filter(project => R.includes(project.projectID, selectedProjectIDs)),
  )(R.concat(uploadedProjects || [], curatedProjects || []))

  const CONTENTS = [
    {
      name: 'projects',
      label: 'Projects',
      icon: 'folder',
      disabled: false,
      component: (
        <ProjectsForm {...{selectedProjectIDs, setSelectedProjectIDs, curatedProjects, uploadedProjects}} />
      )
    },
    {
      name: 'plots',
      label: 'Saved Plots',
      icon: 'area graph',
      disabled: R.isEmpty(selectedProjectIDs),
      component: (
        R.isEmpty(plots) ? (
          <Segment placeholder>
            <Header icon>
              <Icon name='exclamation' />
              No Saved Plots
            </Header>
          </Segment>
        ) : (
          <>
            <Card.Group itemsPerRow={3}>
              {
                R.map(plot => (
                  <PlotCard key={plot.query.id} {...{plot}} />
                ), plots)
              }
            </Card.Group>          
            <Transition visible animation='fade up' duration={1000} unmountOnHide={true} transitionOnMount={true}>
              <Segment basic style={{padding: 0}}>
                <Popup
                  trigger={
                    <span>
                      <Button
                        fluid
                        size="huge"
                        content="Compare"
                        onClick={() => {setOpen(false); dispatch(goToCompare())}}
                        disabled={R.isEmpty(plotQueries)}
                        color={R.isEmpty(plotQueries) ? undefined : 'black'}
                      />
                    </span>
                  }
                  content='Select at least one plot'
                  disabled={!R.isEmpty(plotQueries)}
                  position='bottom center'
                  inverted
                />
              </Segment>
            </Transition>
          </>
        ) 
      )
    }
  ]

  return (
    <Modal
      onClose={onClose}
      onOpen={() => setOpen(true)}
      open={open}
      size="large"
      closeIcon
      trigger={
        <Popup
          trigger={
            <Button 
            icon="exchange" 
            circular 
            size="massive" 
            color="black"
            style={{position: 'fixed', right: '28px', bottom: '28px'}}
            onClick={() => setOpen(true)}
            />
          }
          content='Compare plots across projects and runs'
          position="left center"
          inverted
      />}
    >
      <Modal.Header>
        <Header textAlign='center'>
          <Header.Content>
            Compare Saved Plots
          </Header.Content>
          <Header.Subheader>
            Select saved plots to compare
            <a target="_blank" href='https://pughlab.github.io/crescent-frontend'> (See how to save a plot)</a>
          </Header.Subheader>
        </Header>
      </Modal.Header>
      <Modal.Header>
       
        <Step.Group fluid size='small' widths={4}>
          {
            R.map(
              ({name, label, icon, disabled}) => (
                <Step key={name} title={label} onClick={() => setCurrentContent(name)} icon={icon}
                  active={R.equals(currentContent, name)} disabled={disabled}
                />
              ),
              CONTENTS
            )
          }
        </Step.Group>
      </Modal.Header>
      <Modal.Content scrolling>
        {
          R.compose(
            R.prop('component'),
            R.find(R.propEq('name', currentContent))
          )(CONTENTS)
        }      
      </Modal.Content>
    </Modal>
  )
}

export default CompareModal