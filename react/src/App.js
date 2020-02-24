import './App.css'
import 'semantic-ui-css/semantic.min.css'
import React, {useState, useRef} from 'react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {Segment, Modal, Button, Image, Header, Sticky} from 'semantic-ui-react'

import MenuComponent from './components/menu'
import MainComponent from './components/main'

import Logo from './components/login/logo.jpg'

import withRedux from './redux/hoc'

{/* <div ref={this.contextRef}>
<Sticky context={this.contextRef}>
  <Menu
    attached='top'
    tabular
    style={{ backgroundColor: '#fff', paddingTop: '1em' }}
  >
    <Menu.Item as='a' active name='bio' />
    <Menu.Item as='a' active={false} name='photos' />
    <Menu.Menu position='right'>
      <Menu.Item>
        <Input
          transparent
          icon={{ name: 'search', link: true }}
          placeholder='Search users...'
        />
      </Menu.Item>
    </Menu.Menu>
  </Menu>
</Sticky>
<Segment attached='bottom'>
  {_.times(5, (i) => (
    <Image key={i} src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
  ))}
</Segment>
</div> */}

const App = withRedux(
  () => {

    const contextRef = useRef()
    return (
      <div ref={contextRef} style={{height: '100%'}}>
        <Sticky context={contextRef}>
        <MenuComponent />
        </Sticky>
        <MainComponent />
      </div>
      // <Segment style={{padding: 0}}>
        
        
      // </Segment>
    )
  }
)
export default App
