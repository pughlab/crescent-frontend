import 'semantic-ui-css/semantic.min.css'
import './App.css'

import React from 'react'
import { Segment } from 'semantic-ui-react'

import MenuComponent from './components/menu'
import MainComponent from './components/main'

export default function App() {
  return (
    <Segment style={{padding: 0}}>
      <MenuComponent />
      <MainComponent />
    </Segment>
  )
}
