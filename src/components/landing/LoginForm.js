import React from 'react'
import { Button, Form, Grid, Header, Image, Message, Segment, Card } from 'semantic-ui-react'

import Logo from './logo.jpg'

import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

const LoginForm = ({
  setShowLogin
}) => {
  const [authenticateUser, {loading, data, error}] = useMutation(gql`
    mutation AuthenticateUser($email: Email!, $password: String!) {
      authenticateUser(email: $email, password: $password) {
        userID
      }
    }
  `)
  console.log(authenticateUser, loading, data, error)
  return (
    <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
      <Grid.Column style={{ maxWidth: 450 }}>
        <Form size='large'>
          <Card fluid>
            <Image src={Logo} size='tiny' wrapped ui={false} />
            <Card.Content>
              <Form.Input fluid icon='user' iconPosition='left' placeholder='E-mail address' />
              <Form.Input
                fluid
                icon='lock'
                iconPosition='left'
                placeholder='Password'
                type='password'
              />
            </Card.Content>
            <Card.Content>
              <Button color='grey' fluid size='large'>
                Login
              </Button>
            </Card.Content>
            <Card.Content extra>
              <Button color='grey' fluid onClick={() => setShowLogin(false)}>
                Click to register
              </Button>
            </Card.Content>
          </Card>
        </Form>
      </Grid.Column>
    </Grid>
  )
}

export default LoginForm