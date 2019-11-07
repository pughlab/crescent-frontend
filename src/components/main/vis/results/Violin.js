import React from 'react'
import withRedux from '../../../../redux/hoc'

const ViolinComponent = withRedux(({
  app,
  actions,
}) => {
  console.log('redux state', app)
  console.log('redux actions', actions)
  return (
    <>
    {'Violin'}
    </>
  )
})

export default ViolinComponent