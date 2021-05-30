import React, {useState, useEffect} from 'react';

import {Embed, Header, Segment, Button, Grid, Modal, Label, Divider, Icon, Image, Popup, Message} from 'semantic-ui-react'

import {useCrescentContext} from '../../redux/hooks'

import { useKeycloak } from '@react-keycloak/web'

import Logo from './logo.jpg'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const LoginModal = ({

}) => {
  const {keycloakUser} = useCrescentContext()
  const {name, email} = keycloakUser
  const [open, setOpen] = useState(false)
  const { keycloak, initialized } = useKeycloak()

  return (
    <>
    <Popup inverted size='large'
      trigger={
        <Button color='grey' basic inverted icon size='large' 
          onClick={() => setOpen(!open)}
        >
          <Header>
            <Header.Content color='black' size='huge' content={name} />
          </Header>
        </Button>
      }
      content={`Logged in as ${name} (${email})`}
    />
    <Modal
      {...{open}}
      closeIcon
      onClose={() => setOpen(!open)}
      closeOnDimmerClick={false}
    >
      <Modal.Content>
      {/* put logout here */}
        <Segment.Group>
          <Segment>
            <Image centered size='small' src={Logo}/>
          </Segment>
          <Segment>
          {
            RA.isNotNil(keycloakUser) &&
            <Header>
              {R.prop('name', keycloakUser)}
              <Header.Subheader content={R.prop('email', keycloakUser)} />
            </Header>
          }
          </Segment>
          <Segment>
            <Button
              fluid color='grey' size='massive'
              content='Logout'
              onClick={() => keycloak.logout()}
            />
          </Segment>
        </Segment.Group>
     </Modal.Content>
    </Modal>
    </>
  )
}

export default LoginModal