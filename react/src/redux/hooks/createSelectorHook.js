import { createSelector } from '@reduxjs/toolkit'
import { useSelector } from 'react-redux'
import * as R from 'ramda'

const createSelectorHook = R.thunkify((typeConstant, outputSelector=R.identity) => {
  const selector = createSelector(R.prop(typeConstant), outputSelector)
  const selectorState = useSelector(selector)
  
  return selectorState
})

export default createSelectorHook