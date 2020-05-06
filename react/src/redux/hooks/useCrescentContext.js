import {useEffect} from 'react'
import * as R from 'ramda'
// GQL
import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
// Redux
import {useSelector, useDispatch} from 'react-redux'
import {createSelector} from 'reselect'
import {setUser} from '../actions/context'

export default function useCrescentContext() {
  const dispatch = useDispatch()
  // Get context object from redux store
  const contextSelector = createSelector(R.prop('context'), R.identity)
  const context = useSelector(contextSelector)
  const {userID} = context
  // GraphQL
  const [createGuestUser, {loading, data, error}] = useMutation(gql`
    mutation CreateGuestUser {
      createGuestUser {
        userID
        email
        name
      }
    }
  `, {
    onCompleted: ({createGuestUser: user}) => {
      console.log(user)
      dispatch(setUser(user))
    }
  })
  // If no userID then create guest user
  useEffect(() => {
    createGuestUser()
    return () => {}
  }, [userID])
  console.log(context)
  return context
}
