import React, {useState} from 'react';

import { Icon, Menu, Popup, Header, Segment, Button, Label, Grid, Image, Modal, Divider, Step } from 'semantic-ui-react'

import ClusteringParameterMenu from '../cwl/clustering/ParameterMenu'

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
  visContent,
  setVisContent
}) => {
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
            <Button content='Status' color={isActiveToggle('status') ? 'grey' : undefined}
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
                  <CWLStepButton step={step} setVisContent={setVisContent} />
                ),
                [
                  {step: 'Alignment'},
                  {step: 'Normalization'},
                  {step: 'Clustering'},
                  {step: 'Alignment'},
                  {step: 'Normalization'},
                  {step: 'Clustering'},
                  {step: 'Alignment'},
                  {step: 'Normalization'},
                  {step: 'Clustering'}
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
                  <Button key='submit' content='Submit uploads' />
                ]
              }
            />
            <Button.Or text='&' />
            <Button content='Submit' icon='cloud upload' labelPosition='right' color='blue' />
          </Button.Group>

          : isActiveToggle('status') ?
          <Segment attached='bottom' inverted color='grey' content='Current step running is...' />

          : isActiveToggle('results') ?
          <Segment attached='bottom' inverted color='blue' content='Not done yet...' />

          : null
        }
      </Grid.Column>
    </Segment>
  )
}

export default VisualizationComponent