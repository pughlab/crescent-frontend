import React, {useState, useEffect } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Dropdown } from 'semantic-ui-react'

import * as R from 'ramda'

const VisualizationMenu = withRedux(
  ({
  app: {
    run: { runID },
    toggle: {
      vis: {results: {activeResult, availablePlots, availableGroups}}
    }
  },
  actions: {
    thunks: {
      initializeScatter,
      changeActiveGroup
    }
  }
}) => {

  const changeGroup = (event, {value}) => {
    changeActiveGroup(value)
  }

  // format a list for a dropdown
  const formatList = (list) => {
    return R.addIndex(R.map)(
      (val, index) => {
        return {key: index, text: val, value: val}
      },
      list
    )
  }

  return (
    <Dropdown
      fluid
      selection
      labeled
      defaultValue={availableGroups[0]}
      options={formatList(availableGroups)}
      onChange={changeGroup}
    />
  )
})

export default VisualizationMenu 