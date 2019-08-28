import React, {useState} from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import ProjectSelectModal from './ProjectSelectModal'

const LandingPageComponent = ({
  loggedIn, setLoggedIn,
  setCurrentProjectID
}) => {
  const [showLogin, setShowLogin] = useState(true)

  return (
    loggedIn ?
      <ProjectSelectModal {...{setCurrentProjectID}} />
    : showLogin ?
      <LoginForm {...{setLoggedIn, setShowLogin}} />
    : <RegisterForm {...{setShowLogin}} />
  )
}

export default LandingPageComponent