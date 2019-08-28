import React, {useState} from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import ProjectSelectModal from './ProjectSelectModal'

const LandingPageComponent = ({
  userID, setUserID,
  loggedIn, setLoggedIn,
  setCurrentProjectID
}) => {
  const [showLogin, setShowLogin] = useState(true)

  return (
    loggedIn ?
      <ProjectSelectModal {...{setCurrentProjectID, userID}} />
    : showLogin ?
      <LoginForm {...{setLoggedIn, setShowLogin, setUserID}} />
    : <RegisterForm {...{setShowLogin}} />
  )
}

export default LandingPageComponent