import React from 'react'
import * as R from 'ramda'

import {Segment, Transition, Button} from 'semantic-ui-react'

import ParametersSidebar from '../parameters/ParametersSidebar'
import VisualizationsSidebar from '../visualizations/VisualizationsSidebar'
import LogsSidebar from '../logs/LogsSidebar'
import DataSidebar from '../data/DataSidebar'

import SubmitRunButton from './SubmitRunButton'
import CancelRunButton from './CancelRunButton'
import DownloadResultsButton from './DownloadResultsButton'

import {useDispatch} from 'react-redux'
import {useResultsPage, useCrescentContext} from '../../../../redux/hooks'
import {useRunDetailsQuery} from '../../../../apollo/hooks/run'
import {setActiveSidebarTab} from '../../../../redux/actions/resultsPage'

const SidebarComponent = ({

}) => {
  const {userID: currentUserID, runID} = useCrescentContext()
  const run = useRunDetailsQuery(runID)


  const dispatch = useDispatch()
  const {activeSidebarTab} = useResultsPage()
  const isActiveSidebarTab = R.equals(activeSidebarTab)

  if (R.isNil(run)) {
    return null
  }
  const {status: runStatus, createdBy: {userID: creatorUserID}} = run
  const disableResults = R.equals('pending', runStatus)
  const enableSubmit = R.equals(currentUserID, creatorUserID)
  const runIsSubmitted = R.equals('submitted', runStatus)
  return (
    
    <Segment basic style={{padding: 0, display: 'flex', flexDirection: 'column'}}>
      <Segment attached='top'>
        {/* {
          R.equals('curated', projectKind) ? 
          <PiplinePublicRunMessage />
          : R.equals('pipeline', sidebarView) && <PipelineRunStatusMessage />
        } */}
      </Segment>
      <Segment attached>
        <Button.Group fluid widths={runIsSubmitted ? 4 : 3}>
          <Button compact content='INPUTS' 
            color={isActiveSidebarTab('data') ? 'teal' : undefined}
            active={isActiveSidebarTab('data')}
            onClick={() => dispatch(setActiveSidebarTab({sidebarTab: 'data'}))}
          />
          <Button compact content='PIPELINE' 
            color={isActiveSidebarTab('parameters') ? 'blue' : undefined}
            active={isActiveSidebarTab('parameters')}
            onClick={() => dispatch(setActiveSidebarTab({sidebarTab: 'parameters'}))}
          />
          {
            runIsSubmitted &&
            <Button compact content='LOGS'
              color={isActiveSidebarTab('logs') ? 'red' : undefined}
              active={isActiveSidebarTab('logs')}
              onClick={() => dispatch(setActiveSidebarTab({sidebarTab: 'logs'}))}
            />
          }
          <Button compact content='RESULTS'
            disabled={disableResults}
            color={isActiveSidebarTab('visualizations') ? 'violet' : undefined}
            active={isActiveSidebarTab('visualizations')}
            onClick={() => dispatch(setActiveSidebarTab({sidebarTab: 'visualizations'}))}
          />
        </Button.Group>
      </Segment>
      <Segment attached>
      {
        R.cond([
          [R.equals('data'), R.always(<DataSidebar />)],
          [R.equals('parameters'), R.always(<ParametersSidebar />)],
          [R.equals('visualizations'), R.always(<VisualizationsSidebar />)],
          [R.equals('logs'), R.always(<LogsSidebar />)],
        ])(activeSidebarTab)
      }
      </Segment>
      <Segment attached='bottom'>
      {
        R.cond([
          [R.compose(R.and(runIsSubmitted), R.equals('logs')), R.always(<CancelRunButton />)],
          [R.compose(R.and(enableSubmit), R.equals('parameters')), R.always(<SubmitRunButton />)],
          [R.equals('visualizations'), R.always(<DownloadResultsButton />)],
          [R.T, R.always(null)]
        ])(activeSidebarTab)
      }
      </Segment>

    </Segment>
  )
}

export default SidebarComponent