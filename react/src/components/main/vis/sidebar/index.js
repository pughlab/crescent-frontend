import React, {useState, useEffect, useRef} from 'react';

import { Segment, Button, Transition, Message, Step, Menu, Header, Accordion, Popup, Dropdown } from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import withRedux from '../../../../redux/hoc'

import ResultsSidebar from './ResultsSidebar'
import PipelineSidebar from './PipelineSidebar'

import SubmitRunButton from './SubmitRunButton'
import DownloadResultsButton from './DownloadResultsButton'
import RefreshRunButton from './RefreshRunButton'


const PipelineRunStatusMessage = withRedux(
  ({
    app: {
      user: {
        userID: currentUserID,
      },
      run: {
        createdBy: {
          userID: creatorUserID
        },
        status
      },
    }
  }) => {
    const currentUserNotCreator = R.not(R.equals(currentUserID, creatorUserID))
    const statusColor = R.prop(status, {pending: 'orange', submitted: 'yellow', completed: 'green', failed: 'red'})
    return (
      <>
      <Message
        color={currentUserNotCreator ? 'red' : statusColor}
      >
        <Message.Header as={Header} textAlign='center'>
        {
          currentUserNotCreator ?
            "You are not the creator of this run. You won't be able to submit it but can view results once it is complete."
          :
            R.concat(
              R.ifElse(
                R.equals('pending'),
                R.always('Configure parameters below. '),
                R.always(`Run ${status}. Parameters are not configurable. `)
              )(status),
              R.prop(status, {
                pending: `Click 'SUBMIT RUN' to start pipeline.`,
                submitted: 'Pipeline is currently running.',
                completed: "Click 'RESULTS' to view visualizations.",
                failed: 'This run failed.'
              })
            )
        }
        </Message.Header>

      </Message>
      <Popup content='https://git.io/JfkB9'
        inverted
        position='top left'
        trigger={<Button fluid size='medium' textAlign='center' icon='github' content='R Script (8baf1c051a)' as='a' href='https://git.io/JfkB9' target="_blank"/>
        }
      />
      </>
    )
  }
)

const PiplinePublicRunMessage = () => {
  return (
    <>
    <Message
      color='grey'
    >
      <Message.Header as={Header} textAlign='center' content='Public Run' />
    </Message>
    <Popup content='https://git.io/JfkB9'
        inverted
        position='top left'
        trigger={<Button fluid size='medium' textAlign='center' icon='github' content='R Script (8baf1c051a)' as='a' href='https://git.io/JfkB9' target="_blank"/>
        }
      />
    </>
  )
}

const SidebarComponent = withRedux(
  ({
    app: {
      project: {
        kind: projectKind
      },
      run: {
        status: runStatus
      },
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
            R.equals('curated', projectKind) ? 
            <PiplinePublicRunMessage />
            : R.equals('pipeline', sidebarView) && <PipelineRunStatusMessage />
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
            [
              R.equals('pipeline'),
              R.always(<SubmitRunButton />)
            ],
            [
              R.equals('results'),
              R.always(
                R.equals('submitted', runStatus) ? <RefreshRunButton /> : <DownloadResultsButton />
              )
            ]
          ])(sidebarView)
        }
        </Segment>
      </Segment>
    )
  }
)

export default SidebarComponent
