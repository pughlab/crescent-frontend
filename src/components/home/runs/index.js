import React, {useState, useEffect} from 'react';

import {Menu, Container, Card, Header, Segment, Button, Grid, Modal, Label, Divider, Icon} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import withRedux from '../../../redux/hoc'

const RunCard = withRedux(({
  actions: {
    setRun
  },

  run
}) => {
  const {
    runID, name, params
  } = run
  return (
    <Card link onClick={() => setRun(run)} >
      <Card.Content>
        <Card.Header as={Header}>
          <Header.Content>
            {name}
            <Header.Subheader content={runID} />
          </Header.Content>
        </Card.Header>
      </Card.Content>
      <Card.Content>
        <Card.Description>
          {
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
        </Card.Description>
      </Card.Content>
    </Card>
  )
})

const RunsCardList = withRedux(({
  app: {
    project: {
      runs
    },
  }
}) => {
  return (
    <Container>
      <Header textAlign='center' content='Runs' />
      <Divider />
      <Card.Group itemsPerRow={3}>
      {
        R.map(
          run => <RunCard key={R.prop('runID', run)} {...{run}} />,
          runs
        )
      }
      </Card.Group>
    </Container>
  )
})

export default RunsCardList