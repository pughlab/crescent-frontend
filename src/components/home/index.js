import React, {useState} from 'react';

import { Icon, Menu, Popup, Header, Segment, Button, Label, Grid, Image, Modal, Divider } from 'semantic-ui-react'


import NormalizationVisualization from '../cwl/normalization'
import AlignmentVisualization from '../cwl/alignment'
import ClusteringVisualization from '../cwl/clustering'

const VisualizationComponent = ({
  visContent,
  setVisContent
}) => {

  return (
    <Segment attached='top' style={{height: '90%'}} >
      <Grid style={{height: '100%'}}>
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
          <Segment style={{height: '50%'}} placeholder>
            <Label color='green' attached='top' content='Visualization Panel' />
            Visualization options for {visContent}
          </Segment>
          <Segment style={{height: '50%'}} placeholder>
            <Label color='blue' attached='top' content='Logs' />
            {visContent}
          </Segment>
        </Grid.Column>
      </Grid>
    </Segment>
  )
}

export default VisualizationComponent