import {Card, Header, Icon, Segment} from 'semantic-ui-react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import ProjectRunCard from './ProjectRunCard'

const ProjectRuns = ({ allProjectRuns }) => {
  const projectHasRuns = RA.isNonEmptyArray(allProjectRuns)

  return (
    <>
      { R.not(projectHasRuns) ? (
        <Segment placeholder textAlign="center">
          <Header>
            <Icon name="exclamation" />
            No Runs
          </Header>
        </Segment>
      ) : (
        <Card.Group itemsPerRow={3}>
          { R.map(run => <ProjectRunCard key={run.runID} {...{run}} />, allProjectRuns) }
        </Card.Group>
      )}
    </>
  )
}

export default ProjectRuns