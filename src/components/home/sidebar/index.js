import React, {useState, useEffect, useRef} from 'react';

import { Segment, Button, Icon, Divider, Step, Menu, Header, Accordion, Dropdown } from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import withRedux from '../../../redux/hoc'

import {STEPS, RESULTS} from '../main'

const ResultsMenu = withRedux(
  ({
    app: {
      toggle: {vis: {results: {activeResult, availableResults}}}
    },
    actions: {
      toggle: {setActiveResult}
    }
  }) => {
    
    const isActiveResult = R.equals(activeResult)
    return (
      <Step.Group vertical fluid size='small'>
      {
        R.map(
          ({result, label, description}) => (
            <Step key={result}
              onClick={() => setActiveResult(result)}
            >
              {
                isActiveResult(result)
                && <Icon name='eye' color='violet'/>
              }
              <Step.Content title={label} description={description} />
            </Step>
          ),
          RESULTS
        )
      }
      </Step.Group>
    )
  }
)

const PipelineMenu = withRedux(
  ({
    app: {
      toggle: {vis: {pipeline: {activeStep: activePipelineStep}}},
    },
    actions: {
      toggle: {setActivePipelineStep,}
    }
  }) => {
    const isActivePipelineStep = R.equals(activePipelineStep)
    const StepAccordion = ({step, label}) => (
      <>
        <Accordion.Title active={isActivePipelineStep(step)} onClick={() => setActivePipelineStep(step)}>
          {label}
          {
            isActivePipelineStep(step) &&
              <Icon name='eye' color='blue' style={{paddingLeft: 10}} />
          }
        </Accordion.Title>
        <Accordion.Content active={isActivePipelineStep(step)}>
          <Dropdown options={[]} fluid selection placeholder='Select Tool' />
        </Accordion.Content>
      </>
    )
    return (
      <Accordion styled>
      {
        R.map(
          ({step, label}) => <StepAccordion {...{step, label}} />,
          STEPS
        )
      }
      </Accordion>
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
            [R.equals('pipeline'), R.always(<PipelineMenu />)],
            [R.equals('results'), R.always(<ResultsMenu />)],
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
