import './App.css'
import 'semantic-ui-css/semantic.min.css'
import React from 'react'

import { Segment } from 'semantic-ui-react'

import MenuComponent from './components/menu'
import MainComponent from './components/main'

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
