import React, {useState} from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

const LandingPageComponent = () => {
  const [showLogin, setShowLogin] = useState(true)
  return (
    showLogin ? <LoginForm setShowLogin={setShowLogin} /> : <RegisterForm setShowLogin={setShowLogin} />
  )
}

export default LandingPageComponent