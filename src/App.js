import React, {Component, useState} from 'react';
import './App.css';

import {Segment} from 'semantic-ui-react'

import MenuComponent from './components/menu'
import VisualizationComponent from './components/home'

import LandingComponent from './components/landing'

const App = ({
  session
}) => {
  const [currentRunId, setCurrentRunId] = useState(null)
  const [loggedIn, setLoggedIn] = useState(false)
  return (
    !loggedIn ?
    <LandingComponent /> :
    <Segment style={{height: '100%'}}>
      <VisualizationComponent session={session} currentRunId={currentRunId} setCurrentRunId={setCurrentRunId} />
      <MenuComponent session={session} currentRunId={currentRunId} setCurrentRunId={setCurrentRunId} />
    </Segment>
  )
}

  export default App
