import React, {useState} from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

const LandingPageComponent = ({
  setLoggedIn
}) => {
  const [showLogin, setShowLogin] = useState(true)
  return (
    showLogin ? <LoginForm {...{setLoggedIn, setShowLogin}} /> : <RegisterForm setShowLogin={setShowLogin} />
  )
}

export default LandingPageComponent