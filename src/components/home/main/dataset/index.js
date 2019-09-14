import React, {useState} from 'react'

import * as R from 'ramda'

import {Grid, Menu, Segment, Button, Header, Icon, Divider} from 'semantic-ui-react'

import withRedux from '../../../../redux/hoc'

const DatasetComponent = withRedux(
  ({
    app: {
      toggle: {
        vis: {dataset}
      }
    },
    actions: {
    }
  }) => {
    return (
      <Segment style={{height: '100%'}} color='teal'>
        Merge datasets here
      </Segment>
    )
  }
)

export default DatasetComponent