import React, {useState, useEffect} from 'react';

import {Menu, Card, Header, Segment, Button, Grid, Modal, Label, Divider, Icon, Image, Popup} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import withRedux from '../../redux/hoc'

import InfoModal from './InfoModal'

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
    view: {main}
  },
  actions: {
    // logout,
    toggleProjects,
    toggleRuns,
    toggleLogin
  }
}) => {
  const isMainView = R.equals(main)
  return (
    <Segment attached='top' style={{height: '10%'}} as={Grid}>
      <Grid.Column width={3}>
        <Button.Group fluid widths={3} size='small'>
          <Button icon basic color='black'
            disabled={isMainView('projects')}
            onClick={() => 
              isMainView('login') ? toggleProjects()
              : isMainView('vis') ? toggleRuns()
              : isMainView('runs') ? toggleProjects()
              : isMainView('projects') ? toggleProjects() : null
            }
          >
            <Icon name='double angle left' size='large'/>
          </Button>
          <Button icon basic color='black'
            onClick={() => toggleProjects()}
            disabled={isMainView('projects')}
          >
            <Icon name='archive' size='large'/>
          </Button>
          <Button icon basic color='black'
            onClick={() => toggleRuns()}
            disabled={R.isNil(project) || R.and(RA.isNotNil(project), isMainView('projects'))}
          >
            <Icon name='paper plane' size='large'/>
          </Button>
        </Button.Group>
      </Grid.Column>
      <Grid.Column width={2}>

      </Grid.Column>
      <Grid.Column width={6} verticalAlign='middle'>
        {
          isMainView('projects')  ? 
            <Header textAlign='center'>
            {
              RA.isNotNil(project) ?
                <Label size='large' basic icon='archive' color='black' content={R.prop('name', project)} />
              :
                <Header textAlign='center'>
                  <Icon name='archive' />
                  Select a Project
                </Header>
            }
            </Header>
          : isMainView('runs')  ?
            <Header textAlign='center'>
              <Label.Group size='large'>
                <Label icon='archive' color='black' content={R.prop('name', project)} />
                {
                  RA.isNotNil(run) &&
                  <Label icon='paper plane' basic color='black' content={R.prop('name', run)} />  
                }
              </Label.Group>
              
            </Header>
          : isMainView('login') ?
            <Header textAlign='center'>
              {
                RA.isNotNil(user) ? 
                  <>
                    <Icon name='user circle' />
                    User
                  </>
                :
                  <>
                    <Icon name='sign in' />
                    Sign In
                  </>
              }
            </Header>
          : isMainView('vis') ?
            <Header textAlign='center'>
              <Label.Group size='large'>
                <Label icon='archive' color='black' content={R.prop('name', project)} />
                <Label icon='paper plane' color='black' content={R.prop('name', run)} />
              </Label.Group>
            </Header>
          : null
        }
      </Grid.Column>
      <Grid.Column width={2}>

      </Grid.Column>
      <Grid.Column width={3} verticalAlign='middle'>
        <Button.Group fluid widths={2} size='small'>
          <InfoModal />
          <Button color='black' icon
            basic
            onClick={() => toggleLogin()}
          >
            <Icon size='large' name={'user circle'} />
          </Button>
        </Button.Group>
      </Grid.Column>
    </Segment>
  )
})

export default MenuComponent