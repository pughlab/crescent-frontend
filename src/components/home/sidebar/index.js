import React, {useState, useEffect, useRef} from 'react';

import { Segment, Button, Grid, Divider, Step } from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import withRedux from '../../../redux/hoc'

const STEPS = [
  {label: 'Quality Control', key: 'qc'},
  {label: 'Normalization', key: 'norm'},
  {label: 'Dimension Reduction', key: 'pca'},
  {label: 'Cell Clustering', key: 'tsne'},
  {label: 'Find All Markers', key: 'markers'},
]

const ResultsMenu = withRedux(
  ({
    app: {
      view: {sidebar}
    }
  }) => {
    return (
      <Step.Group vertical fluid ordered>
      {
        R.map(
          ({key, label}) => (
            <Step key={key}>
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

const PipelineMenu = withRedux(
  ({
    app: {
      view: {sidebar}
    }
  }) => {
    return (
      <Step.Group vertical fluid ordered>
      {
        R.map(
          ({key, label}) => (
            <Step key={key}>
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
      view: {sidebar}
    },
    actions: {
      toggleSidebar
    }
  }) => {
    const isSidebarView = R.equals(sidebar)

    return (
      <Segment style={{height: '100%'}}>
        <Button fluid compact
          content='Project Data'
          color={isSidebarView('dataset') ? 'blue' : undefined}
          active={isSidebarView('dataset')}
          onClick={() => toggleSidebar('dataset')}
        />
        <Divider />
        <Segment attached='top'>
          <Button.Group fluid widths={2}>
            <Button compact
              content='Pipeline'
              color={isSidebarView('pipeline') ? 'teal' : undefined}
              active={isSidebarView('pipeline')}
              onClick={() => toggleSidebar('pipeline')}
            />
            <Button compact
              content='Results'
              color={isSidebarView('results') ? 'violet' : undefined}
              active={isSidebarView('results')}
              onClick={() => toggleSidebar('results')}
            />
          </Button.Group>
        </Segment>
        <Segment attached style={{height: '65%', overflowY: 'scroll'}}>
        {
          isSidebarView('pipeline') ? 
           <PipelineMenu />
          : isSidebarView('results') ?
            <ResultsMenu />
          : null
        }
        </Segment>
        <Button fluid attached='bottom' content='Download' />
      </Segment>
    )
  }
)

export default SidebarComponent
