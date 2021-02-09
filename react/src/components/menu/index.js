import React, {useState, useEffect} from 'react';

import {Menu, Card, Header, Segment, Button, Grid, Modal, Label, Divider, Icon, Image, Popup, Message} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import Logo from '../login/logo.jpg'

import InfoModal from '../info/InfoModal'
import ReportBugModal from '../info/ReportBugModal'
import LoginModal from '../login/LoginModal'

import ProjectHeader from './ProjectHeader'
import RunHeader from './RunHeader'

import {useDispatch} from 'react-redux'
import {goHome, goBack} from '../../redux/actions/context'
import {useCrescentContext} from '../../redux/hooks'

const MenuComponent = ({

}) => {
  const dispatch = useDispatch()
  const context = useCrescentContext()
  const {view} = context
  const isCurrentView = R.equals(view)
  return (
    <Segment attached='top' as={Grid}>
      <Grid.Column width={2} verticalAlign='middle'>
        <Button.Group fluid>
          {/* Home button even though there's only three pages... */}
          <Popup inverted
            trigger={
              <Button icon basic inverted color='grey' size='big'
                // disabled={isCurrentView('projects')}
                onClick={() => dispatch(goHome())}
              >
                <Icon size='big'>
                  <Image src={Logo}centered/>
                </Icon>
              </Button>
            }
            content={'Go to Projects (Home)'}
            position='bottom center'
          />

          {/* Back button even though there's only three pages... */}
          {
            R.not(isCurrentView('projects')) &&
            <Popup inverted 
              disabled={isCurrentView('projects')}
              trigger={
                <Button icon basic inverted color='grey'
                  disabled={isCurrentView('projects')}
                  onClick={() => {dispatch(goBack())}}
                >
                  <Icon color='black' name='left arrow' size='large' />
                </Button>
              }
              content={
                isCurrentView('projects') ? 'Back' //Will be disabled anyway
                : isCurrentView('runs') ?
                  'Go back to projects'
                : isCurrentView('results') ?
                  'Go back to runs'
                : 'Back' //Should also never be reached
              }
              position='bottom center'
            />
          }
        </Button.Group>
      </Grid.Column>
      <Grid.Column width={1}/>
      <Grid.Column width={10} verticalAlign='middle' textAlign='center' style={{padding: 0}}>
      {
        isCurrentView('projects') ?
          <Header
            textAlign='center'
            content={'CReSCENT: CanceR Single Cell ExpressioN Toolkit'}
          />
        : isCurrentView('runs') ?
          <ProjectHeader />
        : isCurrentView('results') ?
          <RunHeader />
        : null
      }
      </Grid.Column>
      <Grid.Column width={2} verticalAlign='middle' style={{padding: 0}}>
        <Button.Group fluid widths={2} size='mini'>
          <ReportBugModal />
          <InfoModal />
        </Button.Group>
      </Grid.Column>
      <Grid.Column width={1} verticalAlign='middle' style={{padding: 0}}>
        <Button.Group fluid widths={2} size='mini'>
          <LoginModal />
        </Button.Group>
      </Grid.Column>
    </Segment>
  )
}

export default MenuComponent