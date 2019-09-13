import React, {useState} from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import ProjectSelectModal from '../projects/ProjectSelectModal'

import withRedux from '../../redux/hoc'


const LandingPageComponent = withRedux(
  ({
    app: {
      user
    },
    actions: {
      setUser
    },
    // userID, setUserID,
    // loggedIn, setLoggedIn,
    // currentProjectID, setCurrentProjectID,
    // currentRunId, setCurrentRunId
  }) => {
    const [showLogin, setShowLogin] = useState(true)
    // console.log('asd', user, 'setUser')
    return (
      // loggedIn ?
      //   <ProjectSelectModal {...{
      //     currentProjectID, setCurrentProjectID, 
      //     userID,
      //     setCurrentRunId
      //   }} />
      showLogin ?
        <LoginForm {...{
          // setLoggedIn,
          setShowLogin,
          // setUserID
        }} />
      : <RegisterForm {...{
          setShowLogin
        }} />
    )
  }
)
export default LandingPageComponent