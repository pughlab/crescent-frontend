import {useState} from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import UserInfo from './UserInfo'

import {useCrescentContext} from '../../redux/hooks'
import * as RA from 'ramda-adjunct'

const LandingPageComponent = ({}) => {
  const {isGuest} = useCrescentContext()
  const [showLogin, setShowLogin] = useState(true)
  return (
    showLogin ?
      <LoginForm {...{setShowLogin}} />
    : isGuest ? 
      <RegisterForm {...{setShowLogin}} />
    : <UserInfo />
  )
}
export default LandingPageComponent