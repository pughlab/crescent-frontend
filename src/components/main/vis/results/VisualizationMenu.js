import React, {useState, useEffect } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Button, Form, Divider, Segment, List, Label, Icon, Header } from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const VisualizationMenu = withRedux(
  ({
  app: {
    run: { runID },
    toggle: {
      vis: {results: {availableGroups, selectedFeature, selectedGroup}}
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
  const [currentOptions, changeCurrentOptions] = useState([])

  const checkResponse = (resp) => {
    if(!resp.ok){throw Error(resp.statusText);}
    return resp
  }

  const handleSearchChange = (event, {searchQuery}) => {
    changeSearch(searchQuery)
    if (RA.isNotEmpty(searchQuery)) {
      fetch(`/search/${searchQuery}/${runID}`)
        .then(checkResponse)
        .then(resp => resp.json())
        .then(changeCurrentOptions)
        .catch((err) => console.log(err))
    }
  }

  const handleSelectFeature = (event, {value}) => {
    changeSearch('') // reset search
    changeSelectedFeature(value) // store
  }

  const resetSelectFeature = () => {
    changeSearch('')
    changeCurrentOptions([])
    changeSelectedFeature(null)
  }

  // format a list for a dropdown
  const formatList = R.addIndex(R.map)((val, index) => ({key: index, text: val, value: val}))
  return (
    <Form>
      <Divider horizontal content='Colour By' />
      <Form.Field>
        <Form.Dropdown
          fluid
          selection
          labeled
          defaultValue={RA.isNotNil(selectedGroup) ? selectedGroup : availableGroups[0]}
          options={formatList(availableGroups)}
          onChange={(event, {value}) => changeActiveGroup(value)}
        />
      </Form.Field>
      <Divider horizontal content='Feature Selection' />
      <Form.Field>
        {/* Reset feature selection */}
        <Form.Button
          fluid
          animated='vertical'
          color='violet'
          disabled={R.isNil(selectedFeature)}
          onClick={resetSelectFeature}
        >
          <Button.Content visible>
          {
            RA.isNotNil(selectedFeature) ? selectedFeature : 'Search below'
          }
          </Button.Content>
          <Button.Content hidden>
          {
            RA.isNotNil(selectedFeature) && 'Click to reset'
          }
          </Button.Content>
        </Form.Button>
      </Form.Field>

      <Form.Dropdown
        placeholder='Search for a Feature'
        fluid
        search
        renderLabel = {({text}) => (<Label color='violet' content={text}/>)}
        searchQuery={currentSearch}
        selection
        options={currentOptions}
        value={selectedFeature}
        onSearchChange={handleSearchChange}
        onChange={handleSelectFeature}
      />
      </Form>
  )
})

export default VisualizationMenu 