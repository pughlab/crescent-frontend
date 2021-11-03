import React from 'react'
import {Header, Icon, Segment} from 'semantic-ui-react'
import * as R from 'ramda'
import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'
import {useResultsAvailableQuery} from '../../../../apollo/hooks/results'

const LogsSidebar = () => {    
  const {runID} = useCrescentContext()
  const {runStatus} = useResultsPage()
  const {plots} = useResultsAvailableQuery(runID)

  if (R.any(R.isNil, [runStatus, plots])) return null

  const runIsNotSubmitted = R.not(R.equals('submitted', runStatus))
  if (runIsNotSubmitted) return null

  return (
    <Segment placeholder>
      <Header icon>
        <Icon name="exclamation" />
        The pipeline is currently running.
      </Header>
    </Segment>
  )
}

export default LogsSidebar