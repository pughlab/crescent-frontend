import React from 'react'
import withRedux from '../../../../redux/hoc'

const TSNEComponent = withRedux(({
  app,
  actions,
}) => {
  console.log('redux state', app)
  console.log('redux actions', actions)
  return (
    <>
    {'TSNE'}
    </>
  )
})

export default TSNEComponent