import React, {useState, useEffect} from 'react';

import {Embed, Header, Segment, Button, Grid, Modal, Label, Divider, Icon, Image, Popup, Message} from 'semantic-ui-react'

import {useCrescentContext} from '../../redux/hooks'

const LoginModal = ({

}) => {
  const {keycloakUser} = useCrescentContext()
  const {name, email} = keycloakUser
  const [open, setOpen] = useState(false)
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
     </Modal.Content>
    </Modal>
    </>
  )
}

export default LoginModal