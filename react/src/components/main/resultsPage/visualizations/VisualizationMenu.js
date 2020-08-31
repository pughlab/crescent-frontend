import React, {useState, useEffect } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Button, Form, Divider, Segment, Popup, Label, Icon, Header, Grid } from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useDispatch} from 'react-redux'
import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'
import {useDiffExpressionQuery, useDiffExpressionGroupsQuery, useAvailableGroupsQuery, useTopExpressedQuery, useSearchFeaturesQuery, useCategoricalGroupsQuery} from '../../../../apollo/hooks'
import {setSelectedFeature, setSelectedGroup, setSelectedDiffExpression} from '../../../../redux/actions/resultsPage'

const VisualizationMenu = ({
}) => { 
  // const {changeActiveGroup, changeSelectedFeature} = reduxThunks
  const [currentSearch, setSearch] = useState('')
  const [currentOptions, setCurrentOptions] = useState([])
  
  const {runID} = useCrescentContext()
  const dispatch = useDispatch()

  // console.log("use results: ", useResultsPage())
  const {activeResult, selectedFeature, selectedGroup, selectedDiffExpression } = useResultsPage()
  const isActiveResult = R.equals(activeResult)
 // console.log(activeResult)

  //available groups & top expressed must be queries

  const diffExpression = useDiffExpressionQuery(runID)
  
  // const groups = useAvailableGroupsQuery(runID, selectedDiffExpression)

  const groups = useDiffExpressionGroupsQuery(runID, selectedDiffExpression)
  // const categoricalGroups = useCategoricalGroupsQuery(runID)
  console.log("RUNID:", runID)
  console.log("DIFF:", diffExpression)
  console.log("SEL DIFF:", selectedDiffExpression)
  console.log("SEL GROUP:", selectedGroup)

  const topExpressed = useTopExpressedQuery(runID, selectedDiffExpression)
  const search = useSearchFeaturesQuery(currentSearch, runID)
  console.log("SEARCH OUTSIDE!", search)
  // console.log(search)

  if (R.any(R.isNil, [diffExpression, groups, topExpressed, search])) {
    // console.log(groups, topExpressed)
    return null
  }

    
  // const availableGroupsArray = R.compose(
  //   R.head,
  //   R.values
  // )(groups)

  // const topExpressedArray = R.compose(
  //   R.head,
  //   R.values
  // )(topExpressed)

  // const searchArray = []
  // searchArray.push(search)
  // const searchArray = R.values(search)
  // console.log(searchArray)

  //console.log("SELECTED GROUP: ", selectedGroup) 
  //console.log("SELECTED FEATURE: ", selectedFeature) 
 

  //HERE CHECK RESPONSE, HANDLE SEARCH CHANGE, SELECT FEATURE
  //RESET FEATURE, FEATURE BUTTON


  // const checkResponse = (resp) => {
  //   if(!resp.ok){throw Error(resp.statusText);}
  //   return resp
  // }

 
  // UNSURE
  // const handleSearchChange = (event, {searchQuery}) => {
  //   changeSearch(searchQuery)
  //   console.log("SEARCH QUERY:", searchQuery)
  //   if (RA.isNotEmpty(searchQuery)) {
  //     const isOption = gene => R.startsWith(searchQuery, gene)
  //     console.log(" ALL GENE: ", R.map(R.prop('gene'), topExpressedArray))
  //     const allGenes = R.map(R.prop('gene'), topExpressedArray)
  //     const options =  R.filter(isOption, allGenes)
  //     console.log("OPTIONS:", options)
  //     console.log("TEST:", isOption('CAN'))
  //     changeCurrentOptions(options)
  //     console.log("CURR OP", currentOptions)
  //   }
  // }

  // const handleSearchChange = (event, {searchQuery}) => {
  //   changeSearch(searchQuery)
  //   if (RA.isNotEmpty(searchQuery)) {
  //     fetch(`/express/search/${searchQuery}/${runID}`)
  //       .then(checkResponse)
  //       .then(resp => resp.json())
  //       .then(changeCurrentOptions)
  //       .catch((err) => console.log(err))
  //   }
  // }

  const handleSearchChange = (event, {searchQuery}) => {
    console.log("SEARCH QUERY", searchQuery)
    console.log("CURR OPTION", currentOptions)
    console.log("CURR SEARCH", currentSearch)
    setSearch(searchQuery)
    if (RA.isNotEmpty(searchQuery)) {
      setCurrentOptions(search)
    }
  }

  const handleSelectFeature = (event, {value}) => {
    setSearch(value) // reset search
    dispatch(setSelectedFeature({value})) // store
  }

  const resetSelectFeature = ({value}) => {
    setSearch('')
    setCurrentOptions([])
    dispatch(setSelectedFeature({value}))
  }

  // console.log("TOPEXPrESED ARR: ", topExpressedArray) 

  const FeatureButton = ({gene, pVal, avgLogFc, cluster}) => {
    return (
      <Popup
        size={'tiny'}
        inverted
        trigger={
          <Button value={gene} size='tiny'
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
          {'p-value: '+pVal}<br></br>
          {'avg. log fold change: '+avgLogFc}<br></br>
          {'cluster: '+cluster}
        </Popup.Content>
      </Popup>
    )
  }

  // console.log("AVAILABLE GROUPS:", availableGroupsArray)
  // console.log("SELECTED GROUPS:", selectedGroup)

  
  return(
    <Form>
        <Divider horizontal content='Datasets' />
        <Form.Field>
        <Form.Dropdown fluid selection labeled
          value={selectedDiffExpression}
          options={diffExpression}
          onChange={(e, {value}) => dispatch(setSelectedDiffExpression({value}))}
        />
        </Form.Field>

        <Divider horizontal content='Colour By' />
        <Form.Field>
          <Form.Dropdown fluid selection labeled
            // All groups! assumes that first group is categorical (might not be true in the future)
            value={selectedGroup}
            options={R.addIndex(R.map)((val, index) => ({key: index, text: val, value: val}))(groups)}
            onChange={(e, {value}) => dispatch(setSelectedGroup({value}))}
          />
        </Form.Field>
      <Divider horizontal content='Search Genes' />
      <Form.Group>
        <Form.Field width={12}>
          <Form.Dropdown
            placeholder={"Enter Gene Symbol"}
            fluid
            search
            searchQuery={currentSearch}
            selection
            options={search}
            value={selectedFeature}
            onSearchChange={ handleSearchChange}
            onChange={handleSelectFeature}
          />
        </Form.Field>

        <Form.Field width={4}>
           <Button fluid disabled={R.isNil(selectedFeature)} icon='close' color='violet' onClick={() => resetSelectFeature({value: null})} />
        </Form.Field>
      </Form.Group>

      <Divider horizontal content='Top Differentially Expressed Genes' />
      {
        RA.isNotEmpty(topExpressed) &&
        <Segment basic
          style={{maxHeight: '30vh', overflowY: 'scroll'}}
        >
          {
            R.compose(
              R.map(
                ([cluster, features]) => (
                  <Segment key={cluster} compact size='small'>
                    <Label attached='top' content={`Cluster ${cluster}`} />
                    {
                      R.addIndex(R.map)((feature, idx) => <FeatureButton key={idx} {...feature} />)(features)
                    }
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
}


 export default VisualizationMenu 