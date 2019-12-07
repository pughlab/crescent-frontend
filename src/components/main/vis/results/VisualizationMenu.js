import React, {useState, useEffect } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Button, Form, Divider, Segment, List, Icon, Label } from 'semantic-ui-react'

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
      changeFeatureSearch,
      changeSelectedFeature
    }
  }
}) => {
  useEffect(() => () => {
    changeFeatureSearch('')
    changeSelectedFeature(null)
  }, [])

  const [loadingOptions, setLoadingOptions] = useState(false)
  const [currentSearch, changeSearch] = useState('')
  const [currentFeature, changeFeature] = useState(null)
  const [currentOptions, changeCurrentOptions] = useState([])

  // format a list for a dropdown
  const formatList = R.addIndex(R.map)((val, index) => ({key: index, text: val, value: val}))
  console.log(currentOptions)
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
          onClick={() => {
            // Local state
            changeSearch('')
            changeFeature(null)
            changeCurrentOptions([])
            // Redux
            changeFeatureSearch('')
            changeSelectedFeature(null)
          }}
        >
          <Button.Content visible>
          {
            RA.isNotNil(currentFeature) ? currentFeature : <Icon name='close' />
          } 
          </Button.Content>
          <Button.Content hidden>
            Click to reset
          </Button.Content>
        </Form.Button>
      </Form.Field>

      {/* Search featues and populate list of options */}
      <Form.Group>
        <Form.Field width={10}>
          <Form.Input
            placeholder='Search Features'
            fluid
            value={currentSearch}
            onChange={(e, {value}) => changeSearch(value)}
          />
          </Form.Field>
        <Form.Field width={6}>
        <Form.Button
          fluid color='violet'
          onClick={() => {
            setLoadingOptions(true)
            changeFeatureSearch(currentSearch)
              .then(options => {
                changeCurrentOptions(options)
                setLoadingOptions(false)
              })
          }}
          animated='vertical'
        >
          <Button.Content visible>
            <Icon name='search' />
          </Button.Content>
          <Button.Content hidden>
            Search
          </Button.Content>
        </Form.Button>
      </Form.Field>
      </Form.Group>
      
      {/* List of features to be selected */}
      {
        R.not(R.isEmpty(currentOptions)) &&
          <Segment loading={loadingOptions}>
          {
            R.addIndex(R.map)(
              ({text, value}, index) => (
                <Button key={index}
                  color={R.equals(currentFeature, value) ? 'violet' : 'grey'}
                  onClick={() => {
                    // Local state
                    changeFeature(value)
                    // Redux
                    changeSelectedFeature(value)
                  }}
                >
                {value}
                </Button>
              )
            )(currentOptions)
          }
          </Segment>
      }

    </Form>
  )
})

export default VisualizationMenu 