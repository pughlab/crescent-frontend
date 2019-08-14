import React from 'react'
import { Button, Form, Grid, Header, Image, Message, Segment, Card } from 'semantic-ui-react'

const RegisterForm = ({
  setShowLogin
}) => (
  <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
    <Grid.Column style={{ maxWidth: 450 }}>
      <Form size='large'>
        <Card fluid>
          <Card.Content>
            <Form.Input fluid iconPosition='left' placeholder='First name' />
            <Form.Input fluid iconPosition='left' placeholder='Last name' />
            <Form.Input fluid iconPosition='left' placeholder='E-mail address' />
            <Form.Input
              fluid
              icon='lock'
              iconPosition='left'
              placeholder='Password'
              type='password'
            />
            <Form.Input
              fluid
              icon='lock'
              iconPosition='left'
              placeholder='Confirm password'
              type='password'
            />
          </Card.Content>
          <Card.Content>
            <Button color='grey' fluid size='large'>
              Register
            </Button>
          </Card.Content>
          <Card.Content extra>
            <Button color='grey' fluid onClick={() => setShowLogin(true)}>
              Click to login
            </Button>
          </Card.Content>
        </Card>
      </Form>
    </Grid.Column>
  </Grid>
)

export default RegisterForm