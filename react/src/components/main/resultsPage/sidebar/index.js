import React from 'react'
import * as R from 'ramda'

import {Segment, Transition, Button} from 'semantic-ui-react'
import ParametersSidebar from './ParametersSidebar'
import VisualizationsSidebar from './VisualizationsSidebar'
import SubmitRunButton from './SubmitRunButton'
import CancelRunButton from './CancelRunButton'
import RefreshRunButton from './RefreshRunButton'
import DownloadResultsButton from './DownloadResultsButton'

import {useDispatch} from 'react-redux'
import {useResultsPage, useCrescentContext} from '../../../../redux/hooks'
import {useRunDetailsQuery} from '../../../../apollo/hooks'
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
        <Button.Group fluid widths={2}>
          <Button compact content='PIPELINE' 
            color={isActiveSidebarTab('parameters') ? 'blue' : undefined}
            active={isActiveSidebarTab('parameters')}
            onClick={() => dispatch(setActiveSidebarTab({sidebarTab: 'parameters'}))}
          />
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
          [R.equals('parameters'), R.always(<ParametersSidebar />)],
          [R.equals('visualizations'), R.always(<VisualizationsSidebar />)],
        ])(activeSidebarTab)
      }
      </Segment>
      <Segment attached='bottom'>
      {
        R.cond([
          [R.compose(R.and(enableSubmit), R.equals('parameters')), R.always(<SubmitRunButton />)],
          [R.equals('visualizations'), R.always(
            // R.equals('submitted', runStatus) ? <RefreshRunButton /> : 
            <DownloadResultsButton />
          )],
          [R.T, R.always(null)]
        ])(activeSidebarTab)
      }
      </Segment>
      {
       R.and(R.and(enableSubmit), R.equals('submitted', runStatus)) ? 
          <Segment attached='bottom'> 
            <CancelRunButton />
          </Segment>
        : <></>
      }
    </Segment>
  )
}

export default SidebarComponent