import React, {useState} from 'react'
import { Button, Form, Grid, Header, Image, Modal, Segment, Card, Divider, Container } from 'semantic-ui-react'

import Logo from './logo.jpg'

import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import {Formik} from 'formik'
import * as Yup from 'yup'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {setUser} from '../../redux/actions/context'
import {useDispatch} from 'react-redux'

// Yup form validation
const LoginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Required'),
  password: Yup.string()
    .required('Required')
})

const LoginForm = ({
  // Props
  setOpen,
  setShowLogin, //For toggling to registration
}) => {
  const dispatch = useDispatch()
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
    onCompleted: ({authenticateUser: user}) => {
      if (RA.isNotNil(user)) {
        dispatch(setUser({user}))
        setOpen(false)
      } else {
        setShowErrorModal(true)
      }
    }
  })
  return (
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
          <>
          <Modal open={showErrorModal} basic dimmer='inverted'>
            <Modal.Content>
              <Segment attached='top'>
              <Button fluid size='massive' animated='vertical'
                    color='grey'
                    onClick={() => {
                      setShowErrorModal(false)
                    }}
                  >
                    <Button.Content visible content={'Authentication Failed'} />
                    <Button.Content hidden content={'Try Again'} />
                  </Button>
              </Segment>
              <Segment attached='bottom'>
                <Image src={Logo} size='small' centered/>
              </Segment>
            </Modal.Content>
          </Modal>
          <Segment.Group>
            <Segment>
              <Image centered size='small' src={Logo}/>
            </Segment>
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
                  fluid color='grey' size='massive'
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
          </>
        )
      }}
    />
  )
}

export default LoginForm
