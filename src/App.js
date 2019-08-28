import React, {Component, useState} from 'react';
import './App.css';

import {Segment} from 'semantic-ui-react'

import MenuComponent from './components/menu'
import VisualizationComponent from './components/home'

import LandingComponent from './components/landing'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const App = ({
  session
}) => {
  const [currentRunId, setCurrentRunId] = useState(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const [currentProjectID, setCurrentProjectID] = useState(null)
  return (
      // loggedIn ?
      R.isNil(currentProjectID) ?
      <LandingComponent {...{loggedIn, setLoggedIn, setCurrentProjectID}} /> :
      <Segment style={{height: '100%'}}>
        <VisualizationComponent
          {...{
            session,
            currentRunId, setCurrentRunId
          }}
        />
        <MenuComponent
          {...{
            session,
            currentRunId,
            setCurrentRunId,
            currentProjectID
          }}
        />
      </Segment>
  )
}

  export default App
