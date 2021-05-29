import './App.css'
import 'semantic-ui-css/semantic.min.css'

import React, {useState, useRef, useEffect} from 'react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
// React components
import {Sticky, Segment} from 'semantic-ui-react'

import MenuComponent from './components/menu'
import ProjectsPageComponent from './components/main/projectsPage'
import RunsPageComponent from './components/main/runsPage'
import ResultsPageComponent from './components/main/resultsPage'
import ErrorComponent from './components/error'

import {useMutation} from '@apollo/react-hooks'
import {gql} from 'apollo-boost'


import {setKeycloakUser} from './redux/actions/context'
// Hooks
import {useDispatch} from 'react-redux'
import {useCrescentContext} from './redux/hooks'
import {useMeMutation} from './apollo/hooks/user'

import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import keycloak from './keycloak/keycloak'


const App = () => {
  const stickyRef = useRef()

  const {keycloakUser} = useCrescentContext()
  const dispatch = useDispatch()

  const {me} = useMeMutation()

  useEffect(() => {
    if (RA.isNotNil(me)) {dispatch(setKeycloakUser({keycloakUser: me}))}
  }, [me])

  if (R.isNil(keycloakUser)) {
    return 'loading me'
  }

  // if (RA.isNotNil(error)) {
  //   return (
  //     <ErrorComponent />
  //   )
  // }

  const {keycloakUserID} = keycloakUser

  return (
    <Router>
      <div ref={stickyRef} style={{minHeight: '100vh'}}>
        <MenuComponent />
        <Segment basic style={{marginTop: 0, paddingTop: 0}}>
          {JSON.stringify(keycloakUser)}
          {/* A <Switch> looks through its children <Route>s and renders the first one that matches the current URL. */}
          <Switch>
            <Route path="/">
              <ProjectsPageComponent key={keycloakUserID} />
            {/* {
              R.cond([
                [R.equals('projects'), R.always(
                  
                )],
                [R.equals('runs'), R.always(
                  <RunsPageComponent key={projectID} />
                )],
                [R.equals('results'), R.always(
                  <ResultsPageComponent key={runID} />
                )],
              ])(view)
            } */}
            </Route>
          </Switch>
        </Segment>
      </div>
    </Router>
  )
}
export default App
