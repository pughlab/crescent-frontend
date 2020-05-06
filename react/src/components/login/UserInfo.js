import React, {useEffect} from 'react'
import { Button, Form, Grid, Header, Image, Message, Segment, Card, Divider, Container } from 'semantic-ui-react'

import Logo from './logo.jpg'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import withRedux from '../../redux/hoc'

import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import {useCrescentContext} from '../../redux/hooks'
import {useUserQuery} from '../../apollo/hooks'


const UserInfo = withRedux(({
  // app: {
  //   user: {
  //     name, email
  //   }
  // },
  // actions: {
  //   setGuestUser
  // },

  // Props
  setOpen
}) => {
  const context = useCrescentContext() 
  const {userID} = context
  const user = useUserQuery(userID)
  // const [createGuestUser, {loading, data, error}] = useMutation(gql`
  //   mutation CreateGuestUser {
  //     createGuestUser {
  //       userID
  //       email
  //       name
  //     }
  //   }
  // `, {
  //   onCompleted: ({createGuestUser}) => {
  //     setGuestUser(createGuestUser)
  //     setOpen(false)
  //   }
  // })
  return (
    <Segment.Group>
      <Segment>
        <Image centered size='small' src={Logo}/>
      </Segment>
      <Segment>
      {
        RA.isNotNil(user) &&
        <Header>
          {R.prop('name', user)}
          <Header.Subheader content={R.prop('email', user)} />
        </Header>
      }
      </Segment>
      <Segment>
        <Button
          fluid color='grey' size='massive'
          content='Logout'
          // onClick={() => createGuestUser()}
        />
      </Segment>
    </Segment.Group>
  )
})

export default UserInfo
