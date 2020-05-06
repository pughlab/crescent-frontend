import './App.css'
import 'semantic-ui-css/semantic.min.css'
import memphisMini from './memphis-mini.png'

import React, {useState, useRef, useEffect} from 'react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {Segment, Modal, Button, Image, Header, Sticky} from 'semantic-ui-react'

import MenuComponent from './components/menu'
import ProjectsCardList from './components/main/projects'
import RunsCardList from './components/main/runs'
import ResultsPageComponent from './components/main/results'

import {useSelector, useDispatch} from 'react-redux'

import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {createSelector} from 'reselect'
import {setUser} from './redux/actions/context'


function useCrescentContext() {
  const dispatch = useDispatch()
  // Get context object from redux store
  const contextSelector = createSelector(R.prop('context'), R.identity)
  const context = useSelector(contextSelector)
  const {userID} = context
  // GraphQL
  const [createGuestUser, {loading, data, error}] = useMutation(gql`
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
      dispatch(setUser(user))
    }
  })
  // If no userID then create guest user
  useEffect(() => {
    createGuestUser()
    return () => {}
  }, [userID])
  console.log(context)
  return context
}

const App = () => {
  const stickyRef = useRef()

  const context = useCrescentContext()
  const {view} = context
  return (
    <div ref={stickyRef} style={{height: '100%'}}>
      <Sticky context={stickyRef}>
        <MenuComponent />
      </Sticky>
      {
        R.cond([
          [R.equals('projects'), R.always(
            // <ProjectsCardList />
            'Projects'
          )],
          [R.equals('runs'), R.always(
            // <RunsCardList />
            'Runs'
          )],
          [R.equals('vis'), R.always(
            // <VisComponent />
            'vis'
          )],
        ])(view)
      }
    </div>
  )
}
export default App
