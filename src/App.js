import './App.css'
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
    const [currentRunId, setCurrentRunId] = useState(null)
    const [loggedIn, setLoggedIn] = useState(false)
    const [currentProjectID, setCurrentProjectID] = useState(null)
    const [userID, setUserID] = useState(null)
    const logout = () => {
      setLoggedIn(false)
      setCurrentProjectID(null)
      setCurrentRunId(null)
    }
  
    const isLoggedIn = RA.isNotNilOrEmpty(user)
    console.log('isLoggedIn', isLoggedIn)
    return (
      R.not(isLoggedIn) ?
        <LandingComponent />
      :
        <Segment style={{height: '100%', padding: 0}}>
          <VisualizationComponent
            {...{
              session,
              currentRunId, setCurrentRunId,
              currentProjectID
            }}
          />
          <MenuComponent />
        </Segment>
    )
  }
)
export default App
