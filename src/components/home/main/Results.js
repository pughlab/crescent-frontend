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
      <Segment style={{height: '100%'}} color='violet'>
          Show results here
      </Segment>
    )
  }
)

export default ResultsComponent