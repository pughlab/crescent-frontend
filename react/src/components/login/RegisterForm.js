import React, {useState} from 'react'
import { Button, Form, Image, Modal, Segment, Card, Icon, Header, Message } from 'semantic-ui-react'

import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import { Formik } from 'formik'
import * as Yup from 'yup'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import Logo from './logo.jpg'

import withRedux from '../../redux/hoc'
// See LoginForm.js for congruent comments regarding structure of component

const RegisterValidationSchema = Yup.object().shape({
  firstName: Yup.string().required('First name required'),
  lastName: Yup.string().required('Last name required'),
  email: Yup.string()
    .email('Invalid Email')
    .required('Email required'),
  emailConfirm: Yup.string()
    .oneOf([Yup.ref('email'), null], 'Email mismatch')
    .required('Email confirm required'),
  password: Yup.string().required('Password required'),
  passwordConfirm: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Password mismatch')
    .required('Password confirm required'),
})

const RegisterForm = withRedux(
  ({
    actions: {
      setUser
    },

    // Props
    setOpen,
    setShowLogin
  }) => {
    const [showTerms, setShowTerms] = useState(false)
    const [showErrorModal, setShowErrorModal] = useState(false)
    const [createUser] = useMutation(gql`
      mutation CreateUser(
        $firstName: String!,
        $lastName: String!,
        $email: Email!,
        $password: String!
      ) {
        createUser(
          firstName: $firstName,
          lastName: $lastName,
          email: $email,
          password: $password
        ) {
          userID
          name
          email
        }
      }
    `, {
      onCompleted: ({createUser}) => {
        if (RA.isNotNil(createUser)) {
          setUser(createUser)
          setOpen(false)
        } else {
          setShowErrorModal(true)
        }
      }
    })
    return (

          <Formik
            intialValues={{
              firstName: '', lastName: '',
              email: '', emailConfirm: '',
              password: '', passwordConfirm: ''
            }}
            onSubmit={(values) => {
              // Show terms of usage that user must accept before registering
              setShowTerms(true)
            }}
            validationSchema={RegisterValidationSchema}
            render={({
              values,
              touched,
              errors,
              handleSubmit, handleChange, handleBlur
            }) => {
              // Should be moved into utils once we start using formik more (e.g. for pipelines)?
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
                {/* ERROR MODAL */}
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
                          <Button.Content visible content={'Registration Failed'} />
                          <Button.Content hidden content={'Try Again'} />
                        </Button>
                      </Card.Content>
                      <Image src={Logo} size='large' centered/>
                    </Card>
                  </Modal.Content>
                </Modal>
                {/* CLICK THRU LICENSE */}
                {/* REGISTER USER ONLY IF THEY ACCEPT TERMS */}
                <Modal open={showTerms} size='small' basic dimmer='inverted'>
                  <Modal.Content>
                    <Card fluid>
                      <Card.Content>
                        <Header size='large' textAlign='center' content={'You need to accept terms of usage'}/>
                      </Card.Content>
                      <Card.Content textAlign='center'>
                        {/* Obviously put something more legal here */}
                        I will not upload personal health information to this portal.
                      </Card.Content>
                      <Card.Content>
                        <Button.Group fluid widths={2} size='massive'>
                          <Button animated='vertical'
                            color='grey'
                            onClick={() => {
                              setShowTerms(false)
                            }}
                          >
                            <Button.Content visible content={<Icon name='close' />} />
                            <Button.Content hidden content={'No'} />
                          </Button>
                          <Button animated='vertical'
                            color='grey'
                            onClick={() => {
                              const {firstName, lastName, email, password} = values
                              createUser({variables: {firstName, lastName, email, password}})
                            }}
                          >
                            <Button.Content visible content={<Icon name='check' />} />
                            <Button.Content hidden content={'Yes'} />
                          </Button>
                        </Button.Group>
                      </Card.Content>
                    </Card>
                  </Modal.Content>
                </Modal>


                <Segment.Group>
                  <Segment>
                    <Form size='large' onSubmit={handleSubmit}>
                      <Message 
                        size='huge'
                        header={'Registering with email is optional.'}
                        content={'Please register if you would like your data and results to be saved beyond the session.'}
                      />

                      <Form.Group widths={2}>
                        <Form.Input
                          fluid iconPosition='left' icon='user'
                          placeholder='First name'
                          error={isError('firstName')}
                          name='firstName'
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        <Form.Input 
                          fluid iconPosition='left' icon='user'
                          placeholder='Last name'
                          error={isError('lastName')}
                          name='lastName'
                          onChange={handleChange}
                          onBlur={handleBlur}                    
                        />
                      </Form.Group>
  
                      <Form.Group widths={2}>
                        <Form.Input
                          fluid icon='lock' iconPosition='left'
                          placeholder='Password'
                          type='password'
                          error={isError('password')}
                          name='password'
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        <Form.Input
                          fluid icon='lock' iconPosition='left'
                          placeholder='Confirm password'
                          type='password'
                          error={isError('passwordConfirm')}
                          name='passwordConfirm'
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </Form.Group>
  
                      <Form.Group widths={2}>
                        <Form.Input 
                          fluid iconPosition='left' icon='mail'
                          placeholder='E-mail address'
                          error={isError('email')}
                          name='email'
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        <Form.Input 
                          fluid iconPosition='left' icon='mail'
                          placeholder='Confirm e-mail address'
                          error={isError('emailConfirm')}
                          name='emailConfirm'
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </Form.Group>
  
                      <Form.Button
                        fluid color='grey' size='massive'
                        type='submit'
                        disabled={
                          R.any(RA.isTrue, [
                            R.any(isError, [
                              'firstName',
                              'lastName',
                              'email',
                              'emailConfirm',
                              'password',
                              'passwordConfirm'
                            ]),
                            R.isEmpty(touched)
                          ])
                        }
                        content='Register'
                      />

                    </Form>
                  </Segment>
                  <Segment>
                    <Button animated='fade'
                      fluid color='grey'
                      type='button'
                      onClick={() => setShowLogin(true)}
                    >
                      <Button.Content visible content='Already have an account?' />
                      <Button.Content hidden content='Click to login' />
                    </Button>
                  </Segment>
                </Segment.Group>
                </>
              )
            }}
          />
    )
  }
)



export default RegisterForm