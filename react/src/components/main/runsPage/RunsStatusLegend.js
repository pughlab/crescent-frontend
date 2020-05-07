import React, {useState, useEffect} from 'react';

import {Container, Card, Divider, Button, Header, Icon, Popup, Modal, Dropdown, Label, Segment, Grid, Step, Transition} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import filesize from 'filesize'

import {useCrescentContext, useRunsPage} from '../../../redux/hooks'
import {useProjectRunsQuery} from '../../../apollo/hooks'

const RunsStatusLegend = ({
  // runsBySize,
  // runFilter,
  // setRunFilter
}) => {
  const {activeRunsFilter} = useRunsPage()
  console.log(activeRunsFilter)
  const {projectID} = useCrescentContext()
  const projectRuns = useProjectRunsQuery(projectID)

  const {pending: pendingCount, submitted: submittedCount, completed: completedCount, failed: failedCount} = R.reduce(
    (runCountsByStatus, {status}) => R.over(R.lensProp(status), R.inc, runCountsByStatus),
    {pending: 0, submitted: 0, completed: 0, failed: 0},
    projectRuns
  )
  const totalCount = R.length(projectRuns)

  console.log(totalCount)
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
                // active={R.equals(key, runFilter)}
                // onClick={() => setRunFilter(key)}
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