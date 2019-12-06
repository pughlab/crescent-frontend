import React, {useState, useEffect, useRef} from 'react';

import { Segment, Button, Transition, Message, Step, Menu, Header, Accordion, Dropdown } from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import withRedux from '../../../../redux/hoc'

import ResultsSidebar from './ResultsSidebar'
import PipelineSidebar from './PipelineSidebar'

import SubmitRunButton from '../parameters/SubmitRunButton'
import DownloadResultsButton from '../results/DownloadResultsButton'


const PipelineRunStatusMessage = withRedux(
  ({
    app: {
      run: {
        status
      },
    }
  }) => {
    return (
      <Message
        color={R.prop(status, {pending: 'orange', submitted: 'yellow', completed: 'green'})}
      >
        <Message.Header as={Header} textAlign='center'>
        {
          R.concat(
            R.ifElse(
              R.equals('pending'),
              R.always('Configure your parameters below. '),
              R.always(`Run is ${status} and so parameters are not configurable. `)
            )(status),
            R.prop(status, {
              pending: `Click 'SUBMIT RUN' on the right to send job to HPC.`,
              submitted: 'You will be notified when your run is completed.',
              completed: "Click 'Results' on the right to view visualizations.",
            })
          )
        }
        </Message.Header>

      </Message>
    )
  }
)


const SidebarComponent = withRedux(
  ({
    app: {
      view: {sidebar: sidebarView}
    },
    actions: {toggleSidebar}
  }) => {
    const isSidebarView = R.equals(sidebarView)
    return (
      <Segment basic style={{height: '100%', padding: 0, display: 'flex', flexDirection: 'column'}}>
        <Segment attached='top'>
          <Button.Group fluid widths={2}>
            <Button compact content='PIPELINE' 
              color={isSidebarView('pipeline') ? 'blue' : undefined}
              active={isSidebarView('pipeline')}
              onClick={() => toggleSidebar('pipeline')}
            />
            <Button compact content='RESULTS' 
              color={isSidebarView('results') ? 'violet' : undefined}
              active={isSidebarView('results')}
              onClick={() => toggleSidebar('results')}
            />
          </Button.Group>

          {
            R.equals('pipeline', sidebarView) && <PipelineRunStatusMessage />
          }
        </Segment>
        <Segment attached>
        {
          R.cond([
            [R.equals('pipeline'), R.always(<PipelineSidebar />)],
            [R.equals('results'), R.always(<ResultsSidebar />)],
          ])(sidebarView)
        }
        </Segment>
        <Segment attached='bottom'>
        {
          R.cond([
            [R.equals('pipeline'), R.always(<SubmitRunButton />)],
            [R.equals('results'), R.always(<DownloadResultsButton />)]
          ])(sidebarView)
        }
        </Segment>
      </Segment>
    )
  }
)

export default SidebarComponent
