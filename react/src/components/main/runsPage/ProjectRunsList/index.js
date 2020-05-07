import React from 'react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {Header, Card, Segment, Icon, Transition} from 'semantic-ui-react'

import RunCard from './RunCard'

import {useCrescentContext, useRunsPage} from '../../../../redux/hooks'
import {useProjectRunsQuery} from '../../../../apollo/hooks'

const ProjectRunsList = () => {
  const {projectID} = useCrescentContext()
  const projectRuns = useProjectRunsQuery(projectID)

  const {activeRunsFilter} = useRunsPage()


  console.log(projectRuns)
  return (
    R.isEmpty(projectRuns) ?
      <Transition visible animation='fade up' duration={500} unmountOnHide={true} transitionOnMount={true}>
      <Segment basic>
        <Segment placeholder>
          <Header icon>
            <Icon name='exclamation' />
            No Runs
          </Header>
        </Segment>
      </Segment>
      </Transition>
    :
      <Card.Group itemsPerRow={3}>
      {
        R.addIndex(R.map)(
          (run, index) => (
            <RunCard key={index} {...{run}} />
          ),
          projectRuns
        )
      }
      </Card.Group>
  )
}


export default ProjectRunsList