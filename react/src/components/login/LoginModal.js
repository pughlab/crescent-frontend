import React, {useState, useEffect} from 'react';

import {Embed, Header, Segment, Button, Grid, Modal, Label, Divider, Icon, Image, Popup, Message} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import UserInfo from './UserInfo'

import withRedux from '../../redux/hoc'



const LoginModal = withRedux(({
  app: {
    user,
    view: {isGuest},
  },
}) => {
  const [open, setOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(true)

  useEffect(() => {
    setShowLogin(true)
  }, [open])
  return (
    <>
    <Popup inverted size='large'
      trigger={
        <Button color='grey' inverted basic icon size='large'
          onClick={() => setOpen(!open)}
        >
          <Icon color='black' size='big' name='user circle' />
        </Button>
      }
    >
    {
      isGuest ?
        'Login'
      : 
        <>
        {`Logged in as `}
        <b>
          {R.prop('name', user)}
        </b>
        </>
    }
    </Popup>
    <Modal
      {...{open}}
      closeIcon
      onClose={() => setOpen(!open)}
      closeOnDimmerClick={false}
    >
      <Modal.Content>
      {
        R.not(isGuest) ?
          <UserInfo {...{setOpen}} />
        : showLogin ?
          <LoginForm {...{setOpen, setShowLogin}} />
        : <RegisterForm {...{setOpen, setShowLogin}} />
      }
     </Modal.Content>
    </Modal>
    </>
  )
})

export default LoginModal