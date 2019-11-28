import React, {useState, useEffect } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Dropdown, Grid, Label, Header, Form } from 'semantic-ui-react'

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
      changeActiveGroup,
      changeSelectedFeature
    }
  }
}) => {

  const [currentSearch, changeSearch] = useState('')
  const [currentFeature, changeFeature] = useState([])

  const handleChangeGroup = (event, {value}) => {
    changeActiveGroup(value)
  }

  const handleSearchChange = (event, {searchQuery}) => {
    changeSearch(searchQuery)
    // fetch results of query and update options
    //changeSearchInput(searchQuery) //TOOD: define thunk for this that returns a list of features
  }

  const handleSelectFeature = (event, {value}) => {
    changeSearch('') // reset search
    changeFeature([R.last(value)])
    //changeFeature(() => {return [value[0]]})
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
  console.log(currentFeature)
  return (
    <Form>
      <Form.Dropdown
        label={'Colour By'}
        fluid
        selection
        labeled
        defaultValue={availableGroups[0]}
        options={formatList(availableGroups)}
        onChange={handleChangeGroup}
      />
      <Form.Dropdown
        label={'Feature Selection'}
        placeholder='Search Features'
        fluid
        search
        multiple
        renderLabel = {({text}) => (<Label color='violet' content={text}/>)}
        searchQuery={currentSearch}
        selection
        options={[{"text":"PA2G4","value":"PA2G4"},{"text":"PA2G4P4","value":"PA2G4P4"},{"text":"PAAF1","value":"PAAF1"},{"text":"PABPC1","value":"PABPC1"}]}
        value={currentFeature}
        onSearchChange={handleSearchChange}
        onChange={handleSelectFeature}
      />
    </Form>
  )
})

export default VisualizationMenu 