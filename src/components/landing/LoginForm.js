import React, {useEffect} from 'react'
import { Button, Form, Grid, Header, Image, Message, Segment, Card, Divider } from 'semantic-ui-react'

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
  // setLoggedIn, //For navigating to portal on success
  setShowLogin, //For toggling to registration
  // setUserID
}) => {
  // GraphQL mutation hook to call mutation and use result
  const [authenticateUser, {loading, data, error}] = useMutation(gql`
    mutation AuthenticateUser($email: Email!, $password: String!) {
      authenticateUser(email: $email, password: $password) {
        userID
        sessionToken
        projects {
          projectID
          name
          description
          createdOn
          createdBy {
            name
          }
          runs {
            runID
            name
            params
          }
        }
      }
    }
  `)
  // Use result of effect to navigate to portal
  useEffect(() => {
    console.log(data)
    if (
      R.both(
        RA.isNotNilOrEmpty,
        R.propSatisfies(RA.isNotNil, 'authenticateUser')
      )(data)
    ) {
      const {authenticateUser} = data
      setUser(authenticateUser)

      // setUserID(R.path(['authenticateUser','userID'], data))
      // setLoggedIn(true)
    }
  }, [data])
  return (
    <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
      <Grid.Column style={{ maxWidth: 450 }}>
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
            <Form size='large' onSubmit={handleSubmit}>
              <Card fluid>
                <Image src={Logo} size='tiny' wrapped ui={false} />
                <Card.Content>
                  <Card.Header content='CReSCENT: CanceR Single Cell ExpressioN Toolkit' />
                  <Divider/>
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
                </Card.Content>
                <Card.Content>
                  <Button
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
                </Card.Content>
                <Card.Content extra>
                  <Button
                    fluid color='grey'
                    type='button'
                    onClick={() => setShowLogin(false)}
                    content='Click to register'
                  />
                </Card.Content>
              </Card>
            </Form>
          )
        }}
      />
      </Grid.Column>
    </Grid>
  )
})

export default LoginForm
