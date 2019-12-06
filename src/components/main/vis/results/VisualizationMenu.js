import React, {useState, useEffect } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Label, Form, Divider } from 'semantic-ui-react'

import * as R from 'ramda'

const VisualizationMenu = withRedux(
  ({
  app: {
    run: { runID },
    toggle: {
      vis: {results: {availableGroups}}
    }
  },
  actions: {
    thunks: {
      changeActiveGroup,
      changeFeatureSearch,
      changeSelectedFeature
    }
  }
}) => {

  const [currentSearch, changeSearch] = useState('')
  const [currentFeature, changeFeature] = useState([])
  const [currentOptions, changeCurrentOptions] = useState([])

  const handleChangeGroup = (event, {value}) => {
    changeActiveGroup(value)
  }

  const handleSearchChange = (event, {searchQuery}) => {
    console.log(searchQuery)
    changeSearch(searchQuery)
    // changeFeatureSearch(searchQuery).then(changeCurrentOptions)
  }

  const handleSelectFeature = (event, {value}) => {
    // handle SearchDropdown props 
    changeSearch('') // reset search
    changeFeature([R.last(value)])
    // handle store change
    const handleStoreChange = R.ifElse(
      R.isEmpty,
      R.always(null),
      R.last
    )
    changeSelectedFeature(handleStoreChange(value))
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
  console.log(currentOptions)
  return (
    <Form>
      <Divider horizontal content='Colour By' />
      <Form.Field>
        
        <Form.Dropdown
          // label={'Colour By'}
          fluid
          selection
          labeled
          defaultValue={availableGroups[0]}
          options={formatList(availableGroups)}
          onChange={handleChangeGroup}
        />
      </Form.Field>
      <Divider horizontal content='Feature Selection' />
      <Form.Group widths={2}>
        <Form.Field>
      <Form.Dropdown
        // label={'Feature Selection'}
        placeholder='Search Features'
        fluid
        search
        multiple
        renderLabel = {({text}) => (<Label color='violet' content={text}/>)}
        searchQuery={currentSearch}
        selection
        options={currentOptions}
        value={currentFeature}
        onSearchChange={handleSearchChange}
        onChange={handleSelectFeature}
      />
      </Form.Field>
      <Form.Field>
      <Form.Button
        fluid color='violet'
        onClick={() => changeFeatureSearch(currentSearch).then(
          options => {
            console.log(options)
            changeCurrentOptions(options)
          })}
      >
        Search
      </Form.Button>
      </Form.Field>
      </Form.Group>

    </Form>
  )
})

export default VisualizationMenu 