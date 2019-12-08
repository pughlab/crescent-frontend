import React, {useState} from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import UserInfo from './UserInfo'

import withRedux from '../../redux/hoc'
import * as RA from 'ramda-adjunct'

const LandingPageComponent = withRedux(
  ({
    app: {
      user,
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