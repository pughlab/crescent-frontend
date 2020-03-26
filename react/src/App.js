import './App.css'
import 'semantic-ui-css/semantic.min.css'
import React, {useState} from 'react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {Segment, Modal, Button, Image, Header} from 'semantic-ui-react'

import MenuComponent from './components/menu'
import MainComponent from './components/main'

import Logo from './components/login/logo.jpg'

import withRedux from './redux/hoc'

const App = withRedux(
  () => {
    return (
      <Segment style={{padding: 0}}>
        <MenuComponent />
        <MainComponent />

      </Segment>
    )
  }
)
export default App
