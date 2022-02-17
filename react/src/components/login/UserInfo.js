import {useEffect} from 'react'
import { Button, Form, Grid, Header, Image, Message, Segment, Card, Divider, Container } from 'semantic-ui-react'

import Logo from './logo.jpg'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'


import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import {setUser} from '../../redux/actions/context'

import {useDispatch} from 'react-redux'
import {useCrescentContext} from '../../redux/hooks'
import {useUserQuery} from '../../apollo/hooks/user'


const UserInfo = ({
  setOpen
}) => {
  const dispatch = useDispatch()
  const context = useCrescentContext() 
  const {userID} = context
  const user = useUserQuery(userID)
  // Create guest user to sign out
  const [createGuestUser, {loading, data, error}] = useMutation(gql`
    mutation CreateGuestUser {
      createGuestUser {
        userID
        email
        name
      }
    }
  `, {
    onCompleted: ({createGuestUser: user}) => {
      dispatch(setUser({user}))
      setOpen(false)
    }
  })
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
          onClick={() => createGuestUser()}
        />
      </Segment>
    </Segment.Group>
  )
}

export default UserInfo
