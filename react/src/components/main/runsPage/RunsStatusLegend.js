import React from 'react';

import {Icon, Step} from 'semantic-ui-react'

import * as R from 'ramda'

import {useRunsPage} from '../../../redux/hooks'
import {useDispatch} from 'react-redux'
import {setActiveRunsFilter} from '../../../redux/actions/runsPage'

const RunsStatusLegend = ({ projectRuns }) => {
  const dispatch = useDispatch()
  const {activeRunsFilter} = useRunsPage()
  
  const {pending: pendingCount, submitted: submittedCount, completed: completedCount, failed: failedCount} = R.reduce(
    (runCountsByStatus, {status}) => R.over(R.lensProp(status), R.inc, runCountsByStatus),
    {pending: 0, submitted: 0, completed: 0, failed: 0},
    projectRuns
  )
  const totalCount = R.length(projectRuns)

  // Should be queried from graphql
  // const totalSize = R.compose(
  //   R.sum,
  //   R.values
  // )(runsBySize)

  return (
    <Step.Group fluid widths={5}>
      {
        R.compose(
          R.map(
            ({key, icon, color, title, description}) => (
              <Step key={key}
                active={R.equals(key, activeRunsFilter)}
                onClick={() => dispatch(setActiveRunsFilter({runsFilter: key}))}
              >
                <Icon name={icon} color={color}
                  loading={R.and(R.equals('submitted', key), R.not(R.equals(0, submittedCount)))}
                />
                <Step.Content
                  title={title}
                  description={description}
                />
              </Step>
            )
          )    
        )([
          {
            key: 'all',
            icon: 'file',
            color: 'black',
            title: `${totalCount} Total`,
            // description: `${filesize(totalSize)}`
          },
          {
            key: 'pending',
            icon: 'circle outline',
            color: 'orange',
            title: `${pendingCount} Pending`,
            description: 'To Submit'
          },
          {
            key: 'submitted',
            icon: 'circle notch',
            color: 'yellow',
            title: `${submittedCount} Submitted`,
            description: 'Computing'
          },
          {
            key: 'completed',
            icon: 'circle check',
            color: 'green',
            title: `${completedCount} Completed`,
            description: 'Successfully'
          },
          {
            key: 'failed',
            icon: 'times circle',
            color: 'red',
            title: `${failedCount} Failed`,
            description: 'Errored'
          }
        ])
      }
    </Step.Group>
  )
}

export default RunsStatusLegend