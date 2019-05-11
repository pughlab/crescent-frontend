import React, {Component, useState} from 'react';
import './App.css';

import {Segment} from 'semantic-ui-react'

import MenuComponent from './components/menu'
import VisualizationComponent from './components/home'

const App = ({
  session
}) => {
    return (
      <Segment style={{height: '100%'}}>
        <VisualizationComponent session={session} />
        <MenuComponent />
      </Segment>
    )
  }

  export default App
