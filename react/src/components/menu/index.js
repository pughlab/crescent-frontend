import React, {useState, useEffect} from 'react';

import {Menu, Card, Header, Segment, Button, Grid, Modal, Label, Divider, Icon, Image, Popup, Message} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import Logo from '../login/logo.jpg'

import Marquee from 'react-marquee'
import InfoModal from '../info/InfoModal'
import LoginModal from '../login/LoginModal'

import {useDispatch} from 'react-redux'
import {goHome, goBack} from '../../redux/actions/context'
import {useCrescentContext} from '../../redux/hooks'

const MenuComponent = ({

}) => {
  // const isMainView = R.equals(main)
  const context = useCrescentContext()
  const {view} = context
  const dispatch = useDispatch()
  return (
    <Segment attached='top' as={Grid}>
      <Grid.Column width={2} verticalAlign='middle'>
        <Button.Group fluid>
          {/* Home button even though there's only three pages... */}
          <Popup inverted
            trigger={
              <Button icon basic inverted color='grey' size='large'
                onClick={() => dispatch(goHome())}
              >
                <Icon size='big'>
                  <Image src={Logo}centered/>
                </Icon>
              </Button>
            }
            content={'Go to Projects'}
            position='bottom center'
          />

          {/* Back button even though there's only three pages... */}
          <Popup inverted 
            trigger={
              <Button icon basic inverted color='grey'
                disabled={R.not(R.equals('projects', view))}
                onClick={() => {dispatch(goBack())}}
                // onClick={() => {
                //   if (isMainView('runs')) {
                //     toggleProjects()
                //   } else if (isMainView('vis')) {
                //     toggleRuns()
                //   } else if (
                //     R.any(isMainView, ['login', 'info'])
                //   ) {
                //     // Go back to projects for now
                //     R.isNil(project) ? toggleProjects() : toggleRuns()
                //   }
                // }}
                // disabled={R.or(isMainView('projects'), R.isNil(project))}
              >
                <Icon color='black' name='left arrow' size='large' />
              </Button>
            }
            content={
              'Back'
              // isMainView('runs') ?
              //   'Go back to projects'
              // : isMainView('vis') ?
              //   'Go back to runs'
              // : R.isNil(project) ? 'Go back to projects' : 'Go back to runs'
            }
            position='bottom center'
          />
        </Button.Group>
      </Grid.Column>
      <Grid.Column width={12} verticalAlign='middle' textAlign='center' style={{padding: 0}}>
        
        {
          'header goes here'
          // isMainView('projects')  ? 
          //   <Header
          //     textAlign='center'
          //     // size='large'
          //     content={'CReSCENT: CanceR Single Cell ExpressioN Toolkit'}
          //   />
          // : isMainView('runs')  ?
          //   <Header textAlign='center'
          //     // size='large'
          //     content={R.prop('name', project)}
          //   />
          // : isMainView('login') ?
          //   <Header textAlign='center'
          //   >
          //     {
          //       RA.isNotNil(user) ? 
          //         <>
          //           User
          //         </>
          //       :
          //         <>
          //           <Icon name='sign in' />
          //           Log In
          //         </>
          //     }
          //   </Header>
          // : isMainView('vis') ?
          //   <Header textAlign='center'
          //     // size='large'
          //     content={R.prop('name', project)}
          //     subheader={R.prop('name', run)}
          //   />
          // : <Header textAlign='center' content={'Info'} /> 
        }
      </Grid.Column>
      <Grid.Column width={2} verticalAlign='middle'>
        <Button.Group fluid widths={2} size='mini'>
          <InfoModal />
          {/* <LoginModal /> */}
        </Button.Group>
      </Grid.Column>
    </Segment>
  )
}

export default MenuComponent