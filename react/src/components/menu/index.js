import React, {useState, useEffect} from 'react';

import {Menu, Card, Header, Segment, Button, Grid, Modal, Label, Divider, Icon, Image, Popup, Message} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import withRedux from '../../redux/hoc'

import Logo from '../landing/logo.jpg'

import Marquee from 'react-marquee'

const CrescentIcon = () => (
  <Icon.Group style={{marginTop: -3}} >
    <Icon name='cloud' size='big'  />
    <Icon name='moon' size='small' inverted style={{marginTop: 2, marginLeft: -2}} />
  </Icon.Group>
)


const MenuComponent = withRedux(({
  app: {
    user,
    project,
    run,
    view: {main, isGuest}
  },
  actions: {
    // logout,
    toggleInfo,
    toggleProjects,
    toggleRuns,
    toggleLogin
  }
}) => {
  const isMainView = R.equals(main)
  return (
    <Segment attached='top' style={{height: '5rem'}} as={Grid}>
      <Grid.Column width={2} verticalAlign='middle'>
      {
        <Button.Group fluid size='mini'>
          <Popup inverted size='large'
            trigger={
              <Button icon basic inverted color='grey' size='large'
                onClick={() => toggleProjects(isGuest ? 'published' : 'uploaded')}
              >
                {/* <Icon color='black' name='home' size='large'/> */}
                <Icon size='huge'>
                  <Image src={Logo} centered/>
                </Icon>
              </Button>
            }
            content={
              isMainView('projects') ? 'Go to projects' : 'Go to projects'
            }
            position='bottom center'
          />
          <Popup inverted size='large'
            trigger={
              <Button icon basic inverted color='grey' size='large'
                onClick={() => {
                  if (isMainView('runs')) {
                    toggleProjects()
                  } else if (isMainView('vis')) {
                    toggleRuns()
                  } else if (
                    R.any(isMainView, ['login', 'info'])
                  ) {
                    // Go back to projects for now
                    R.isNil(project) ? toggleProjects() : toggleRuns()
                  }
                }}
                // disabled={R.or(isMainView('projects'), R.isNil(project))}
                disabled={isMainView('projects')}
              >
                <Icon color='black' name='left arrow' size='big'/>
              </Button>
            }
            content={
              isMainView('runs') ?
                'Go back to projects'
              : isMainView('vis') ?
                'Go back to runs'
              : R.isNil(project) ? 'Go back to projects' : 'Go back to runs'
            }
            position='bottom center'
          />
        </Button.Group>
      }
      </Grid.Column>
      <Grid.Column width={12} verticalAlign='middle' textAlign='center' style={{padding: 0}}>
        {
          isMainView('projects')  ? 
            <Header
              textAlign='center'
              // size='large'
              content={'CReSCENT: CanceR Single Cell ExpressioN Toolkit'}
            />
          : isMainView('runs')  ?
            <Header textAlign='center'
              // size='large'
              content={R.prop('name', project)}
            />
          : isMainView('login') ?
            <Header textAlign='center'
            >
              {
                RA.isNotNil(user) ? 
                  <>
                    User
                  </>
                :
                  <>
                    <Icon name='sign in' />
                    Log In
                  </>
              }
            </Header>
          : isMainView('vis') ?
            <Header textAlign='center'
              // size='large'
              content={R.prop('name', project)}
              subheader={R.prop('name', run)}
            />
          : <Header textAlign='center' content={'Info'} /> 
        }
      </Grid.Column>
      <Grid.Column width={2} verticalAlign='middle'>
        <Button.Group fluid widths={2} size='mini'>
          <Popup inverted size='large'
            trigger={
              <Button color='grey' inverted basic icon size='large'
                onClick={() => toggleInfo()}
              >
                <Icon color='black' size='big' name='info circle' />
              </Button>
            }
            content={
              'Info/Help'
            }
          />
          <Popup inverted size='large'
            trigger={
              <Button basic inverted icon color='grey' size='large'
                onClick={() => toggleLogin()}
              >
                <Icon color='black' size='big' name={'user circle'} />
              </Button>
            }
            content={
              'Log in/out'
            }
          />
        </Button.Group>
      </Grid.Column>
    </Segment>
  )
})

export default MenuComponent