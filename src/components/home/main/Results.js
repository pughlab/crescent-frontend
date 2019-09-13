import React, {useState} from 'react'

import * as R from 'ramda'

import {Grid, Menu, Segment, Button, Header, Icon, Divider} from 'semantic-ui-react'

import withRedux from '../../../redux/hoc'

const ResultsComponent = withRedux(
  ({
    app: {
      toggle: {
        vis: {results}
      }
    },
    actions: {
    }
  }) => {
    return (
      <Segment inverted style={{height: '100%'}} color='violet'>
        <Segment style={{height: '100%'}}>
          Show results here
        </Segment>
      </Segment>
    )
  }
)

export default ResultsComponent