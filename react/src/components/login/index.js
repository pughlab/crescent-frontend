import React, { useState } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import UserInfo from './UserInfo'

import withRedux from '../../redux/hoc'

const LandingPageComponent = withRedux(
  ({
    app: {
      view: {isGuest},
    },
  }) => {
    const [showLogin, setShowLogin] = useState(false)
    return (
      showLogin ?
        <LoginForm {...{setShowLogin}} />
      : isGuest ? 
        <RegisterForm {...{setShowLogin}} />
      : <UserInfo />
    )
  }
)
export default LandingPageComponent