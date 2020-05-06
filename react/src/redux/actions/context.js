import * as R from 'ramda'

const setUser = ({user}) => ({
  type: 'context/setUser',
  payload: {
    user
  }
})

const goHome = R.always({
  type: 'context/goHome'
})

const goBack = R.always({
  type: 'context/goBack'
})

export {
  setUser,
  goHome,
  goBack
}