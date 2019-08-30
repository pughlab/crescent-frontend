import React, {useState} from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import ProjectSelectModal from '../projects/ProjectSelectModal'

const LandingPageComponent = ({
  userID, setUserID,
  loggedIn, setLoggedIn,
  currentProjectID, setCurrentProjectID,
}) => {
  const [showLogin, setShowLogin] = useState(true)

  return (
    loggedIn ?
      <ProjectSelectModal {...{currentProjectID, setCurrentProjectID, userID}} />
    : showLogin ?
      <LoginForm {...{setLoggedIn, setShowLogin, setUserID}} />
    : <RegisterForm {...{setShowLogin}} />
  )
}

export default LandingPageComponent