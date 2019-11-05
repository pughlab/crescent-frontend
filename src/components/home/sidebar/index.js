import React, {useState, useEffect, useRef} from 'react';

import { Segment, Button, Icon, Divider, Step, Menu } from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import withRedux from '../../../redux/hoc'

import {STEPS, RESULTS} from '../main'

const DatasetMenu = withRedux(
  ({
    app: {
      view: {sidebar}
    }
  }) => {
    return (
      <Step.Group vertical fluid size='small'>
            <Step>
              <Icon name='upload' />
              <Step.Content title={'genes'}
                description='filename'
              />
            </Step>
            <Step>
              <Icon name='upload' />
              <Step.Content title={'features'}
                description='filename'
              />
            </Step>
            <Step>
              <Icon name='upload' />
              <Step.Content title={'matrix'}
                description='filename'
              />
            </Step>
      </Step.Group>
    )
  }
)

const ResultsMenu = withRedux(
  ({
    app: {
      view: {sidebar},
      toggle: {vis: {results: {activeResult, availableResults}}}
    },
    actions: {
      toggle: {
        setActiveResult
      }
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
      view: {sidebar},
      toggle: {vis: {pipeline: {activeStep: activePipelineStep}}},
      sidebar: {
        parameters: {
          singleCell,
          numberGenes: {min: minNumberGenes, max: maxNumberGenes},
          percentMito: {min: minPercentMito, max: maxPercentMito},
          resolution,
          principalDimensions,
        }
      }
    },
    actions: {
      toggle: {
        setActivePipelineStep,
      }
    }
  }) => {
    const isActivePipelineStep = R.equals(activePipelineStep)
    return (
      <Step.Group vertical fluid ordered size='small'>
      {
        R.map(
          ({step, label}) => (
            <Step key={step}
              onClick={() => setActivePipelineStep(step)}
            >
              {
                isActivePipelineStep(step) &&
                <Icon name='eye' color='blue'/>
              }
              <Step.Content title={label} description={'Seurat'} />
            </Step>
          ),
          STEPS
        )
      }
      </Step.Group>
    )
  }
)

const SidebarComponent = withRedux(
  ({
    app: {
      project,
      run,
      view: {sidebar: sidebarView}
    },
    actions: {
      toggleSidebar
    }
  }) => {
    const isSidebarView = R.equals(sidebarView)
    const sidebarKinds = [
      {key: 'dataset', label: 'Dataset', color: 'teal'},
      {key: 'pipeline', label: 'Pipeline', color: 'blue'},
      {key: 'results', label: 'Results', color: 'violet'},
    ]
    return (
      <Segment basic style={{height: '100%', padding: 0}}>
        <Segment attached='top'
          color={
            R.cond([
              [R.equals('dataset'), R.always('teal')],
              [R.equals('pipeline'), R.always('blue')],
              [R.equals('results'), R.always('violet')],
            ])(sidebarView)                    
          }
        >
          <Button.Group fluid widths={3}>
          {
            R.map(
              ({key, label, color}) => (
                <Button key={key}
                  compact
                  content={label}
                  color={isSidebarView(key) ? color : undefined}
                  active={isSidebarView(key)}
                  onClick={() => toggleSidebar(key)}
                />
              ),
              sidebarKinds
            )
          }
          </Button.Group>
        </Segment>
        <Segment attached style={{height: '80%', overflowY: 'scroll'}}>
        {
          R.cond([
            [R.equals('dataset'), R.always(
              <DatasetMenu />
            )],
            [R.equals('pipeline'), R.always(
              <PipelineMenu />
            )],
            [R.equals('results'), R.always(
              <ResultsMenu />
            )],
          ])(sidebarView)
        }
        </Segment>
        <Segment attached='bottom'>
        {
          R.cond([
            [R.equals('dataset'), R.always(
              <Button fluid 
                content='Download Dataset'
                color='teal'
              />
            )],
            [R.equals('pipeline'), R.always(
              <Button fluid
                content='Submit Run'
                color='blue'
              />
            )],
            [R.equals('results'), R.always(
              <Button fluid 
                content='Download Results'
                color='violet'
              />
            )]
          ])(sidebarView)
        }
        </Segment>
      </Segment>
    )
  }
)

export default SidebarComponent