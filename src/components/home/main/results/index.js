import React, {useState} from 'react'

import * as R from 'ramda'

import {Grid, Menu, Segment, Button, Header, Icon, Divider} from 'semantic-ui-react'

import withRedux from '../../../../redux/hoc'

import TSNEComponent from './TSNE'
import UMAPComponent from './UMAP'
import ViolinComponent from './Violin'

const ResultsComponent = withRedux(
  ({
    app: {
      toggle: {
        vis: {results: {activeResult}}
      }
    },
    actions: {
    }
  }) => {
    return (
      <>
      {
        R.cond([
          [R.equals('tsne'), R.always(
            <TSNEComponent />
          )],
          [R.equals('umap'), R.always(
            <UMAPComponent />
          )],
          [R.equals('violin'), R.always(
            <ViolinComponent />
          )],
          [R.isNil, R.always(
            <Segment basic placeholder style={{height: '100%'}}>
              <Header textAlign='center' content='Select a visualization on the left' />
            </Segment>
          )]
        ])(activeResult)
      }
      </>
    )
  }
)

export default ResultsComponent