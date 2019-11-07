import React from 'react'
import withRedux from '../../../../redux/hoc'

const UMAPComponent = withRedux(({
  app,
  actions,
}) => {
  console.log('redux state', app)
  console.log('redux actions', actions)
  return (
    <>
    {'UMAP'}
    </>
  )
})

export default UMAPComponent