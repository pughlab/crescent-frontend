import React, {Component, useState} from 'react';
import './App.css';

import {Segment} from 'semantic-ui-react'

import MenuComponent from './components/menu'
import VisualizationComponent from './components/home'

import LandingComponent from './components/landing'

import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

const App = ({
  session
}) => {
  const [currentRunId, setCurrentRunId] = useState(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const {loading, data, error} = useQuery(gql`
    {
      users {
        userID
      }
    }
  `)
  console.log(loading, data, error)
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
