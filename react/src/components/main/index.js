import React, { useEffect } from 'react';

import { Segment, Grid } from 'semantic-ui-react'

import memphisMini from '../../memphis-mini.png'

import * as R from 'ramda'

import withRedux from '../../redux/hoc'

import ProjectsCardList from './projects'
import RunsCardList from './runs'
import VisComponent from './vis'

import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

const MainComponent = withRedux(
  ({
    app: {
      user,
      view: {main: mainView, isGuest}
    },
    actions: {
      setGuestUser,
    },
  }) => {
    const [createGuestUser] = useMutation(gql`
      mutation CreateGuestUser {
        createGuestUser {
          userID
          email
          name
        }
      }
    `, {
      onCompleted: ({createGuestUser}) => {
        setGuestUser(createGuestUser)
      }
    })

    useEffect(() => {
      if (R.isNil(user)) {
        createGuestUser()
      }
      return () => {}
    }, [isGuest])
    return (
      <Segment basic attached='bottom' style={{minHeight: 'calc(100vh - 5rem - 2px)', marginTop: 0,  backgroundImage: `url(${memphisMini})`}}>
      {
        R.cond([
          [R.equals('projects'), R.always(
            <Grid.Column width={16} style={{height: '100%'}}>
              <ProjectsCardList />
            </Grid.Column>
          )],
          [R.equals('runs'), R.always(
            <Grid.Column width={16} style={{height: '100%'}}>
              <RunsCardList />
            </Grid.Column>
          )],
          [R.equals('vis'), R.always(
            <VisComponent />
          )],
        ])(mainView)
      }
      </Segment>
    )
  }
)

export default MainComponent
