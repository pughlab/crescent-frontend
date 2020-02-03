import React, {useState, useEffect } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Button, Form, Divider, Segment, Popup, Label, Icon, Header, Grid } from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const VisualizationMenu = withRedux(
  ({
  app: {
    run: { runID },
    toggle: {
      vis: {results: {availableGroups, selectedFeature, selectedGroup, topExpressed}}
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
      fetch(`/express/search/${searchQuery}/${runID}`)
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

  const featureButton = ({gene, p_val, avg_logFC, cluster}) => {
    return (
      <Popup
        size={'tiny'}
        inverted
        trigger={
          <Button value={gene}
            onClick={handleSelectFeature}
            color='violet'
            style={{margin: '0.25rem'}}
            basic={R.not(R.equals(selectedFeature,gene))}
          >
            {gene}
          </Button>
        }
      >
        <Popup.Content>
          {'p-value: '+p_val}<br></br>
          {'avg. log fold change: '+avg_logFC}<br></br>
          {'cluster: '+cluster}
        </Popup.Content>
      </Popup>
    )
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
      <Divider horizontal />
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
            RA.isNotNil(selectedFeature) ? selectedFeature : 'Select or Search for a Gene'
          }
          </Button.Content>
          <Button.Content hidden>
          {
            RA.isNotNil(selectedFeature) && 'Click to Reset'
          }
          </Button.Content>
        </Form.Button>
      </Form.Field>
      <Divider horizontal content='Search Genes' />
      <Form.Dropdown
        placeholder={"Enter Gene Symbol"}
        fluid
        search
        searchQuery={currentSearch}
        selection
        options={currentOptions}
        value={selectedFeature}
        onSearchChange={handleSearchChange}
        onChange={handleSelectFeature}
      />
      <Divider horizontal content='Top Differentially Expressed Genes' />

      {
        RA.isNotEmpty(topExpressed) &&
        <Segment basic
          style={{maxHeight: '40vh', overflowY: 'scroll'}}
        >
          {
            R.compose(
              R.map(
                ([cluster, features]) => (
                  <Segment key={cluster} compact>
                    <Label attached='top' content={`Cluster ${cluster}`} />
                    {R.map(featureButton, features)}
                  </Segment>
                )
              ),
              R.toPairs,
              R.groupBy(R.prop('cluster'))
            )(topExpressed)
          }
        </Segment>
      }
      </Form>
  )
})

export default VisualizationMenu 