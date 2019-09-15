import './App.css'
import 'semantic-ui-css/semantic.min.css'
import React, {useState} from 'react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {Segment} from 'semantic-ui-react'

import MenuComponent from './components/menu'
import VisualizationComponent from './components/home'
import LandingComponent from './components/landing'

import withRedux from './redux/hoc'

const App = withRedux(
  ({
    app: {
      user,
      view
    },
    actions,
    session,
  }) => {
    const isLoggedIn = RA.isNotNilOrEmpty(user)
    return (
      R.not(isLoggedIn) ?
        <LandingComponent />
      :
        <Segment style={{height: '100%', padding: 0}}>
          <VisualizationComponent {...{session}} />
          <MenuComponent />
        </Segment>
    )
  }
)
export default App
