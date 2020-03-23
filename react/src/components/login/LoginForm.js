import React, {useState} from 'react'
import { Button, Form, Grid, Header, Image, Modal, Segment, Card, Divider, Container } from 'semantic-ui-react'

import Logo from './logo.jpg'

import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import {Formik} from 'formik'
import * as Yup from 'yup'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import withRedux from '../../redux/hoc'

// Yup form validation
const LoginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Required'),
  password: Yup.string()
    .required('Required')
})

const LoginForm = withRedux(({
  app: {
    user
  },
  actions: {
    setUser
  },
  setShowLogin, //For toggling to registration
}) => {
  const [showErrorModal, setShowErrorModal] = useState(false)
  // GraphQL mutation hook to call mutation and use result
  const [authenticateUser, {loading, data, error}] = useMutation(gql`
    mutation AuthenticateUser($email: Email!, $password: String!) {
      authenticateUser(email: $email, password: $password) {
        userID
        name
        email
        sessionToken
      }
    }
  `, {
    onCompleted: ({authenticateUser}) => {
      if (RA.isNotNil(authenticateUser)) {
        setUser(authenticateUser)
      } else {
        setShowErrorModal(true)
      }
    }
  })
  return (
    <>
    <Grid textAlign='center' centered verticalAlign='middle' columns={1}>
      <Grid.Column>
      <Formik
        initialValues={{ email: '', password: '' }}
        // Call GQL mutation on form submit
        onSubmit={(values, actions) => {
          const {email, password} = values
          authenticateUser({variables: {email, password}})
        }}
        // Use validation schema defined above
        validationSchema={LoginValidationSchema}
        render={({
          touched, errors,
          handleSubmit, handleChange, handleBlur
        }) => {
          const isError = valueName => R.and(
            R.both(
              R.has(valueName),
              R.compose(RA.isNotNil, R.prop(valueName))
            )(touched),
            R.both(
              R.has(valueName),
              R.compose(RA.isNotNil, R.prop(valueName))
            )(errors)
          )
          return (
            <Container text>
            <Modal open={showErrorModal} size='small' basic dimmer='inverted'>
              <Modal.Content>
                <Card fluid>
                  <Card.Content>
                    <Button fluid size='massive' animated='vertical'
                      color='grey'
                      onClick={() => {
                        setShowErrorModal(false)
                      }}
                    >
                      <Button.Content visible content={'Authentication Failed'} />
                      <Button.Content hidden content={'Try Again'} />
                    </Button>
                  </Card.Content>
                  <Image src={Logo} size='large' centered/>
                </Card>
              </Modal.Content>
            </Modal>
            <Segment.Group>
              <Segment>
                
                <Form onSubmit={handleSubmit}>
                  <Form.Input
                    fluid icon='user' iconPosition='left'
                    placeholder='E-mail address'
                    error={isError('email')}
                    name='email'
                    onChange={handleChange}
                    onBlur={handleBlur}             
                  />
                  <Form.Input
                    fluid icon='lock' iconPosition='left'
                    placeholder='Password'
                    error={isError('password')}
                    type='password'
                    name='password'
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />

                  <Form.Button
                    fluid color='grey' size='large'
                    disabled={
                      R.any(RA.isTrue, [
                        R.any(isError, ['email', 'password']),
                        R.isEmpty(touched)
                      ])
                    }
                    type='submit'
                    content='Login'
                  />
                </Form>
              </Segment>
              <Segment>
                <Button animated='fade'
                  fluid color='grey'
                  type='button'
                  onClick={() => setShowLogin(false)}
                >
                  <Button.Content visible content="No account?" />
                  <Button.Content hidden content='Click to register' />  
                </Button>
              </Segment>
            </Segment.Group>
            </Container>
          )
        }}
      />
      </Grid.Column>
    </Grid>
    </>
  )
})

export default LoginForm
