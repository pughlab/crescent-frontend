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


import {setUser} from './redux/actions/context'
// Hooks
import {useDispatch} from 'react-redux'
import {useCrescentContext} from './redux/hooks'


import keycloak from './keycloak'


const App = () => {
  const context = useCrescentContext()
  const {view, userID, projectID, runID, error} = context
  const dispatch = useDispatch()
  
  // TODO: put into custom hoook
  const [createGuestUser] = useMutation(gql`
    mutation CreateGuestUser {
      createGuestUser {
        userID
        email
        name
      }
    }
  `, {
    onCompleted: ({createGuestUser: user}) => {
      console.log(user)
      dispatch(setUser({user}))
    }
  })
  // If no userID then create guest user
  useEffect(() => {
    if (R.isNil(userID)) {
      console.log('Creating Guest User')
      createGuestUser()
    }
    return () => {}
  }, [userID])

  const stickyRef = useRef()

  if (RA.isNotNil(error)) {
    return (
      <ErrorComponent />
    )
  }

  return (
    <div ref={stickyRef} style={{minHeight: '100vh'}}>
      {/* <Sticky context={stickyRef}> */}
        <MenuComponent />
      {/* </Sticky> */}
      <Segment basic style={{marginTop: 0, paddingTop: 0}}>
      {
        R.cond([
          [R.equals('projects'), R.always(
            <ProjectsPageComponent key={userID} />
          )],
          [R.equals('runs'), R.always(
            <RunsPageComponent key={projectID} />
          )],
          [R.equals('results'), R.always(
            <ResultsPageComponent key={runID} />
          )],
        ])(view)
      }
      </Segment>
    </div>
  )
}
export default App
