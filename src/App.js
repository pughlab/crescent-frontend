import React, {Component, useState} from 'react';
import './App.css';

import {Segment} from 'semantic-ui-react'

import MenuComponent from './components/menu'
import VisualizationComponent from './components/home'

const App = ({
  session
}) => {
    const [visContent, setVisContent] = useState('Home')

    return (
      <Segment style={{height: '100%'}}>
        <VisualizationComponent session={session}
          visContent={visContent}
          setVisContent={setVisContent}
        />
        <MenuComponent
          visContent={visContent}
          setVisContent={setVisContent}
        />
      </Segment>
    )
  }

  export default App
