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
      vis: {results: {availableGroups}}
    }
  },
  actions: {
    thunks: {
      changeActiveGroup,
      changeSelectedFeature
    }
  }
}) => {
  // Reset feature selection on unmount
  useEffect(() => () => {
    changeSelectedFeature('')
  }, [])

  
  const [currentSearch, changeSearch] = useState('')
  const [currentFeature, changeFeature] = useState('')
  const [currentOptions, changeCurrentOptions] = useState([])

  const checkResponse = (resp) => {
    if(!resp.ok){throw Error(resp.statusText);}
    return resp
  }

  const handleSearchChange = (event, {searchQuery}) => {
    changeSearch(searchQuery)
    if(! R.isEmpty(searchQuery)){
      fetch(`/search/${searchQuery}/${runID}`)
      .then(checkResponse)
      .then(resp => resp.json())
      .then(R.identity)
      .then(changeCurrentOptions)
      .catch((err) => console.log(err))
    }
  }

  const handleSelectFeature = (event, {value}) => {
    if(R.isNil(value)){value = '';}
    // handle SearchDropdown props 
    changeSearch('') // reset search
    const handleChange = R.ifElse(
      R.isEmpty,
      R.always(''),
      R.last
    )
    changeFeature(value) //local state
    changeSelectedFeature(value) // store
  }

  console.log(currentOptions)
  console.log(currentFeature)
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
          defaultValue={availableGroups[0]}
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
          onClick={handleSelectFeature}        
        >
          <Button.Content visible>
          {
            RA.isNotEmpty(currentFeature) ? currentFeature : <Icon name='close' />
          } 
          </Button.Content>
          <Button.Content hidden>
            Click to reset
          </Button.Content>
        </Form.Button>
      </Form.Field>

      <Form.Dropdown
        label={'Feature Selection'}
        placeholder='Search Features'
        fluid
        search
        renderLabel = {({text}) => (<Label color='violet' content={text}/>)}
        searchQuery={currentSearch}
        selection
        options={currentOptions}
        value={currentFeature}
        onSearchChange={handleSearchChange}
        onChange={handleSelectFeature}
      />
      </Form>
  )
})

export default VisualizationMenu 