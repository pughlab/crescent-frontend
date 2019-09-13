import React, {useState, useEffect, useRef} from 'react';

import { Segment, Button, Label, Divider, Step } from 'semantic-ui-react'

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
      <Step.Group vertical fluid ordered size='small'>
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
      view: {sidebar},
      sidebar: {
        parameters: {
          singleCell,
          numberGenes: {min: minNumberGenes, max: maxNumberGenes},
          percentMito: {min: minPercentMito, max: maxPercentMito},
          resolution,
          principalDimensions,
        }
      }
    }
  }) => {
    return (
      <Label.Group size='large' basic>
        <Label basic color='blue' content='Single Cell Input Type' detail={singleCell} />
        <Label basic color='blue' content='Number of Genes' detail={`Min = ${minNumberGenes} | Max = ${maxNumberGenes}`} />
        <Label basic color='blue' content='Mitochondrial Fraction' detail={`Min = ${minPercentMito} | Max = ${maxPercentMito}`} />
        <Label basic color='blue' content='Clustering Resolution' detail={resolution} />
        <Label basic color='blue' content='PCA Dimensions' detail={principalDimensions} />
      </Label.Group>
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
          color={isSidebarView('dataset') ? 'teal' : undefined}
          active={isSidebarView('dataset')}
          onClick={() => toggleSidebar('dataset')}
        />
        {
          isSidebarView('pipeline') ? 
            <Button fluid attached='bottom' content='Submit' />
          : isSidebarView('results') ?
            <Button fluid attached='bottom' content='Download' />
          : null
        }
        <Divider />
        <Segment attached='top'>
          <Button.Group fluid widths={2}>
            <Button compact
              content='Pipeline'
              color={isSidebarView('pipeline') ? 'blue' : undefined}
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
        <Segment attached style={{height: '70%', overflowY: 'scroll'}}>
        {
          isSidebarView('pipeline') ? 
            <PipelineMenu />
          : isSidebarView('results') ?
            <ResultsMenu />
          : null
        }
        </Segment>
      </Segment>
    )
  }
)

export default SidebarComponent
