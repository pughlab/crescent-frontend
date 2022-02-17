import {useState, useEffect} from 'react';

import {Embed, Header, Segment, Button, Grid, Modal, Label, Divider, Icon, Image, Popup, Message} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import UserInfo from './UserInfo'

import {useCrescentContext} from '../../redux/hooks'
import {useUserQuery} from '../../apollo/hooks/user'


const LoginModal = ({

}) => {
  const context = useCrescentContext()
  const {userID, isGuest} = context
  const [open, setOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(true)
  useEffect(() => {
    setShowLogin(true)
  }, [open])

  const user = useUserQuery(userID)
  return (
    <>
    <Popup inverted size='large'
      trigger={
        <Button color='grey' basic inverted icon size='large' 
          onClick={() => setOpen(!open)}
        >
          <Header>
            {/* <Icon color='black' size='big' name='user circle' /> */}
            <Header.Content color='black' size='huge'>
              {R.prop('name', user)}
            </Header.Content>
          </Header>
        </Button>
      }
    >
    {
      isGuest ?
        'Login'
      : RA.isNotNil(user) ?
        <>
        {`Logged in as `}
        <b>
          {R.prop('name', user)}
        </b>
        </>
      : null
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
}

export default LoginModal