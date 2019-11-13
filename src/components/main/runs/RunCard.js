import React, {useState, useEffect} from 'react';

import {Transition, Container, Card, Header, Form, Button, Modal, Label, Divider, Icon, Popup} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import withRedux from '../../../redux/hoc'

import Marquee from 'react-marquee'
import moment from 'moment'


const RunCard = withRedux(({
  // Redux actions
  actions: {setRun},
  // Prop
  run
}) => {
  const {
    runID, createdOn, name, params, createdBy: {name: creatorName}, completed
  } = run
  return (
    <Transition visible animation='fade down' duration={500} unmountOnHide={true} transitionOnMount={true}>
    <Card link onClick={() => setRun(run)} color={completed ? 'green' : 'yellow'}>
      <Card.Content>
        <Label attached='top'
          // Color based on whether run is complete or not
          color={completed ? 'green' : 'yellow'}
        >
          <Icon name='file' size='large' style={{margin: 0}} />
        </Label>
        <Card.Header>
          <Marquee text={name} />
        </Card.Header>
      </Card.Content>
      <Card.Content extra content={`Created by ${creatorName} on ${moment(createdOn).format('D MMMM YYYY')}`} />
      <Card.Content>
        <Popup
          trigger={
            <Button basic icon><Icon name='sliders horizontal' /> </Button>
          }
          content={
            RA.isNotNil(params) &&
            R.compose(
              ({
                singleCell,
                numberGenes: {min: minNumberGenes, max: maxNumberGenes},
                percentMito: {min: minPercentMito, max: maxPercentMito},
                resolution,
                principalDimensions,
              }) => (
                <Label.Group>
                  <Label content='Single Cell Input Type' detail={singleCell} />
                  <Label content='Number of Genes' detail={`Min = ${minNumberGenes} | Max = ${maxNumberGenes}`} />
                  <Label content='Mitochondrial Fraction' detail={`Min = ${minPercentMito} | Max = ${maxPercentMito}`} />
                  <Label content='Clustering Resolution' detail={resolution} />
                  <Label content='PCA Dimensions' detail={principalDimensions} />
  
                </Label.Group>
              ),
              JSON.parse
            )(params)
          }
        />
      </Card.Content>
    </Card>
    </Transition>
  )
})

export default RunCard