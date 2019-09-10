import './App.css'
import React, {useState} from 'react'
import * as R from 'ramda'

import {Segment} from 'semantic-ui-react'

import MenuComponent from './components/menu'
import VisualizationComponent from './components/home'
import LandingComponent from './components/landing'

const App = ({session}) => {
  const [currentRunId, setCurrentRunId] = useState(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const [currentProjectID, setCurrentProjectID] = useState(null)
  const [userID, setUserID] = useState(null)
  return (
    // loggedIn ?
    R.isNil(currentProjectID) ?
    <LandingComponent
      {...{
        userID, setUserID,
        loggedIn, setLoggedIn,
        currentProjectID, setCurrentProjectID,
        currentRunId, setCurrentRunId
      }}
    /> :
    <Segment style={{height: '100%', padding: 0}}>
      <VisualizationComponent
        {...{
          session,
          currentRunId, setCurrentRunId,
          currentProjectID
        }}
      />
      <MenuComponent
        {...{
          userID, setUserID,
          currentRunId, setCurrentRunId,
          currentProjectID, setCurrentProjectID
        }}
      />
    </Segment>
  )
}

export default App
