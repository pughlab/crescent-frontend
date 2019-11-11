import React, {useState, useEffect} from 'react';

import {Transition, Container, Card, Header, Form, Button, Modal, Label, Divider, Icon, Popup} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import withRedux from '../../../redux/hoc'

import Marquee from 'react-marquee'

const RunCard = withRedux(({
  // Redux actions
  actions: {setRun},
  // Prop
  run
}) => {
  const {
    runID, name, params
  } = run
  return (
    <Transition visible animation='fade down' duration={500} unmountOnHide={true} transitionOnMount={true}>
    <Card link onClick={() => setRun(run)} >
      <Card.Content>
        <Card.Header as={Header}>
          <Icon name='file' circular />
          <Header.Content>
            <Marquee text={name} />
          </Header.Content>
        </Card.Header>
      </Card.Content>
      {/* <Card.Content extra content={`Created by ${creatorName} on ${moment(createdOn).format('D MMMM YYYY')}`} /> */}
      <Card.Content>
        {
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
      </Card.Content>
    </Card>
    </Transition>
  )
})

export default RunCard