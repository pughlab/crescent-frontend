import React, {useState} from 'react';

import { Icon, Menu, Popup, Header, Segment, Button, Label, Grid, Image, Modal, Divider, Step } from 'semantic-ui-react'

import ClusteringParameterMenu from '../cwl/clustering/parameters/ParametersMenu'

import NormalizationVisualization from '../cwl/normalization'
import AlignmentVisualization from '../cwl/alignment'
import ClusteringVisualization from '../cwl/clustering'

import * as R from 'ramda'

const CWLStepButton = ({
  step,
}) => {
  return (
    <Modal size='large'
      trigger={
        <Step>
          {/* <Icon name='check /> */}
          <Step.Content title={step} description={'Tool name goes here'} />
        </Step>
      }
    >
      <Modal.Header content={step} />
      <Modal.Content scrolling>
        <ClusteringParameterMenu />
      </Modal.Content>
      <Modal.Actions>
        <Button content='Call API HERE'
          onClick={() => console.log('Submitted parameters')}
        />

      </Modal.Actions>
    </Modal>
  )
}


const VisualizationComponent = ({
  session,

  visContent,
  setVisContent
}) => {
  const submitCWL = () => {
    session.call('crescent.submit', [], {})
  }

  const [activeToggle, setActiveToggle] = useState('params')
  const isActiveToggle = R.equals(activeToggle)
  return (
    <Segment attached='top' style={{height: '90%'}} as={Grid}>
      <Grid.Column width={12} style={{height: '100%'}}>
        <Header content={visContent} />
        <Divider />
        {
          visContent=='Home' ?
          'Home summary/dashboard here'
          : visContent=='Alignment' ?
          <AlignmentVisualization />
          : visContent=='Normalization' ?
          <NormalizationVisualization />
          : visContent=='Clustering' ?
          <ClusteringVisualization />
          : null
        }
      </Grid.Column>
      <Grid.Column width={4} style={{height: '100%'}}>
        <Segment attached='top'>
          <Button.Group fluid widths={3}>
            <Button content='Parameters' color={isActiveToggle('params') ? 'red' : undefined}
              active={isActiveToggle('params')} onClick={() => setActiveToggle('params')}
            />
            <Button content='Status' color={isActiveToggle('status') ? 'green ' : undefined}
              active={isActiveToggle('status')} onClick={() => setActiveToggle('status')}
            />
            <Button content='Results' color={isActiveToggle('results') ? 'blue' : undefined}
              active={isActiveToggle('results')} onClick={() => setActiveToggle('results')}
            />
          </Button.Group>
        </Segment>
        <Segment attached style={{height: '80%', overflowY: 'scroll'}}>
          <Step.Group vertical fluid ordered
            items={
              R.map(
                ({step}) => (
                  <CWLStepButton key={step} step={step} setVisContent={setVisContent} />
                ),
                [
                  // {step: 'QC/Alignment'},
                  {step: 'Normalization'},
                  {step: 'Dimension Reduction'},
                  {step: 'Cell Clustering'},
                  // {step: 'Differential Expression'},
                  {step: 'Visualizations'},
                  // {step: 'Cell Cluster Labelling'},
                  // {step: 'Gene/Pathway Interactions'},
                ]
              )
            }
          />
        </Segment>
        {
          isActiveToggle('params') ?
          <Button.Group fluid widths={2} attached='bottom' size='big'>
            <Modal
              trigger={
                <Button color='red' content='Upload' icon='upload' labelPosition='left'/>
              }
              header='Upload Workflow Inputs Here'
              content='Upload API stuff here'
              actions={
                [
                  <Button key='upload' content='Submit uploads' />
                ]
              }
            />
            <Button.Or text='&' />
            <Button
              content='Submit'
              icon='cloud upload' labelPosition='right'
              color='blue'
              // disabled
              onClick={() => submitCWL()}
            />
          </Button.Group>

          : isActiveToggle('status') ?
          <Segment attached='bottom' inverted color='green ' content='Current step running is...' />

          : isActiveToggle('results') ?
          <Segment attached='bottom' inverted color='blue' content='Not done yet...' />

          : null
        }
      </Grid.Column>
    </Segment>
  )
}

export default VisualizationComponent