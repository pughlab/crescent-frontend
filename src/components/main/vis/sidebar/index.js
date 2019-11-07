import React, {useState, useEffect, useRef} from 'react';

import { Segment, Button, Icon, Divider, Step, Menu, Header, Accordion, Dropdown } from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import withRedux from '../../../../redux/hoc'

import ResultsSidebar from './ResultsSidebar'
import PipelineSidebar from './PipelineSidebar'

const SidebarComponent = withRedux(
  ({
    app: {
      view: {sidebar: sidebarView}
    },
    actions: {toggleSidebar}
  }) => {
    const isSidebarView = R.equals(sidebarView)
    return (
      <Segment basic style={{height: '100%', padding: 0}}>
        <Segment attached='top'>
          <Button.Group fluid widths={2}>
            <Button compact content='Pipeline' 
              color={isSidebarView('pipeline') ? 'blue' : undefined}
              active={isSidebarView('pipeline')}
              onClick={() => toggleSidebar('pipeline')}
            />
            <Button compact content='Results' 
              color={isSidebarView('results') ? 'violet' : undefined}
              active={isSidebarView('results')}
              onClick={() => toggleSidebar('results')}
            />
          </Button.Group>
        </Segment>
        <Segment attached style={{height: '80%', overflowY: 'scroll'}}>
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
            [R.equals('pipeline'), R.always(
              <Button fluid content='Submit Run' color='blue' />
            )],
            [R.equals('results'), R.always(
              <Button fluid content='Download Results' color='violet' />
            )]
          ])(sidebarView)
        }
        </Segment>
      </Segment>
    )
  }
)

export default SidebarComponent
