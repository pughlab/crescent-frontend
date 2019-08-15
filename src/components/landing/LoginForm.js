import React, {useEffect} from 'react'
import { Button, Form, Grid, Header, Image, Message, Segment, Card } from 'semantic-ui-react'

import Logo from './logo.jpg'

import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import {Formik} from 'formik'
import * as Yup from 'yup'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

// Yup form validation
const LoginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Required'),
  password: Yup.string()
    .required('Required')
})

const LoginForm = ({
  setLoggedIn,
  setShowLogin
}) => {
  const [authenticateUser, {loading, data, error}] = useMutation(gql`
    mutation AuthenticateUser($email: Email!, $password: String!) {
      authenticateUser(email: $email, password: $password) {
        userID
      }
    }
  `)
  useEffect(() => {
    if (RA.isNotNilOrEmpty(data) && R.has('authenticateUser', data)) {
      setLoggedIn(true)
    }
  }, [data])
  return (
    <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
      <Grid.Column style={{ maxWidth: 450 }}>
      <Formik
        initialValues={{ email: '', password: '' }}
        onSubmit={(values, actions) => {
          console.log(values)
          const {email, password} = values
          authenticateUser({variables: {email, password}})
        }}
        render={({
          values: {email, password},
          handleSubmit, handleChange
        }) => (
          <Form size='large' onSubmit={handleSubmit}>
            <Card fluid>
              <Image src={Logo} size='tiny' wrapped ui={false} />
              <Card.Content>
                <Form.Input
                  fluid icon='user' iconPosition='left'
                  placeholder='E-mail address'
                  value={email}
                  name='email'
                  onChange={handleChange}                  
                />
                <Form.Input
                  fluid icon='lock' iconPosition='left'
                  placeholder='Password'
                  type='password'
                  value={password}
                  name='password'
                  onChange={handleChange}
                />
              </Card.Content>
              <Card.Content>
                <Button color='grey' fluid size='large' type='submit'>
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
        )}
      />
      </Grid.Column>
    </Grid>
  )
}

export default LoginForm