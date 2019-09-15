import React, {useState} from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

import withRedux from '../../redux/hoc'

const LandingPageComponent = withRedux(
  ({}) => {
    const [showLogin, setShowLogin] = useState(true)
    return (
      showLogin ?
        <LoginForm {...{setShowLogin}} />
      : <RegisterForm {...{setShowLogin}} />
    )
  }
)
export default LandingPageComponent