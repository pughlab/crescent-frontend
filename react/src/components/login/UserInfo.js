import React from 'react'
import { Button, Header, Image, Segment } from 'semantic-ui-react'

import Logo from './logo.jpg'

import withRedux from '../../redux/hoc'

import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

const UserInfo = withRedux(({
  app: {
    user: {
      name, email
    }
  },
  actions: {
    setGuestUser
  },

  // Props
  setOpen
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
      setOpen(false)
    }
  })
  return (
    <Segment.Group>
      <Segment>
        <Image centered size='small' src={Logo}/>
      </Segment>
      <Segment>
        <Header>
          {name}
          <Header.Subheader content={email} />
        </Header>
      </Segment>
      <Segment>
        <Button
          fluid color='grey' size='massive'
          content='Logout' onClick={() => createGuestUser()}
        />
      </Segment>
    </Segment.Group>
  )
})

export default UserInfo
