import React, {useEffect} from 'react'
import { Button, Form, Grid, Header, Image, Message, Segment, Card, Divider, Container } from 'semantic-ui-react'

import Logo from './logo.jpg'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import withRedux from '../../redux/hoc'



const UserInfo = withRedux(({
  app: {
    user: {
      name, email
    }
  },
}) => {
  // Use result of effect to navigate to portal
  return (
    <Grid textAlign='center' centered verticalAlign='middle' columns={1}>
      <Grid.Column>
        <Container text>
          <Segment.Group>
            <Segment>
              <Image centered size='small' src={Logo}/>
            </Segment>
            <Segment>
              {name}
            </Segment>
            <Segment>
              {email}
            </Segment>
          </Segment.Group>
          </Container>
      </Grid.Column>
    </Grid>
  )
})

export default UserInfo
