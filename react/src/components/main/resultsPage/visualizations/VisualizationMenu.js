import React, {useState, useEffect } from 'react'
import Plot from 'react-plotly.js'
import { Button, Form, Divider, Segment, Popup, Label, Icon, Header, Grid } from 'semantic-ui-react'
import { Fade } from 'react-reveal'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { useService } from '@xstate/react';
import {useDispatch} from 'react-redux'
import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'
import {useResultsPagePlotQuery} from '../../../../redux/hooks/useResultsPage'
import {useDiffExpressionQuery, useDiffExpressionGroupsQuery, useTopExpressedQuery, useSearchFeaturesQuery, useDiffExpressionCategoricalGroupsQuery, useSetAssaysQuery} from '../../../../apollo/hooks/results'
import {setSelectedFeature, setSelectedGroup, setSelectedDiffExpression, setSelectedAssay} from '../../../../redux/slices/resultsPage'

const VisualizationMenu = ({
}) => { 
  // const {changeActiveGroup, changeSelectedFeature} = reduxThunks
  const [currentSearch, setCurrentSearch] = useState('')
  const [currentOptions, setCurrentOptions] = useState([])
  
  const {runID} = useCrescentContext()
  const dispatch = useDispatch()

  // console.log("use results: ", useResultsPage())
  const {activePlot} = useResultsPage()
  const {activeResult, selectedFeature, selectedGroup, selectedDiffExpression, selectedAssay, service} = useResultsPagePlotQuery(activePlot)
  const isActiveResult = R.equals(activeResult)
  const isActiveAssay = R.equals(selectedAssay)

 const [current, send] = useService(service)
  //available groups & top expressed must be queries
  const diffExpression = useDiffExpressionQuery(runID)
  
  // const groups = useAvailableGroupsQuery(runID, selectedDiffExpression)

  const groups = useDiffExpressionGroupsQuery(runID, selectedDiffExpression)
  const categoricalGroups = useDiffExpressionCategoricalGroupsQuery(runID, selectedDiffExpression, isActiveResult('violin'))
  // const categoricalGroups = useCategoricalGroupsQuery(runID)

  const assays = useSetAssaysQuery(runID)

  const topExpressed = useTopExpressedQuery(runID, selectedDiffExpression, selectedAssay)
  const searchOptions = useSearchFeaturesQuery(currentSearch, runID, selectedAssay)


  useEffect(() => {
    setCurrentSearch(selectedFeature || '')
  }, [selectedFeature])

  // clear selected feature when a numeric group is selected
   useEffect(() => {
    if(categoricalGroups && selectedFeature && !R.includes(selectedGroup, categoricalGroups)){
      dispatch(setSelectedFeature({value: null, send}))
    }
  }, [selectedGroup])

  if (R.any(R.isNil, [diffExpression, groups, categoricalGroups, topExpressed, searchOptions, assays])) {
    return null
  }

  // when selected group is numerical, disable gene selection
  const disableGeneSelection = !R.includes(selectedGroup, categoricalGroups) 

  const handleSearchChange = (event, {searchQuery}) => {
    // console.log("SEARCH QUERY", searchQuery)
    // console.log("CURR OPTION", currentOptions)
    // console.log("CURR SEARCH", currentSearch)
    setCurrentSearch(searchQuery)
    if (RA.isNotEmpty(searchQuery)) {
      setCurrentOptions(searchOptions)
    }
  }

  const handleSelectFeature = (e, {value}) => { if (!R.equals(value, selectedFeature)) dispatch(setSelectedFeature({value, send}))}

  const resetSelectFeature = () => {
    setCurrentSearch('')
    setCurrentOptions([])
    dispatch(setSelectedFeature({value: null, send}))
  }

  const FeatureButton = ({gene, pVal, avgLogFc, cluster}) => {
    return (
      <Popup
        size={'tiny'}
        inverted
        trigger={
          <Button value={gene} size='tiny'
            disabled = {R.test(/.*Loading/, current.value) || disableGeneSelection}
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

  const formatList = R.addIndex(R.map)((val, index) => ({key: index, text: val, value: val}))
  
  return(
    <Fade>
      <Form>
          <Divider horizontal content='Datasets' />
          <Form.Field>
          <Form.Dropdown fluid selection labeled
            disabled = {R.test(/.*Loading/, current.value)}
            value={selectedDiffExpression}
            options={diffExpression}
            onChange={(e, {value}) => dispatch(setSelectedDiffExpression({value, send}))}
          />
          </Form.Field>

          {!isActiveAssay('legacy') && 
          <>
            <Divider horizontal content='RNA Normalization' />
            <Form.Field>
              <Form.Dropdown fluid selection labeled
                disabled = {R.test(/.*Loading/, current.value)}
                value={selectedAssay}
                // options={formatList(R.map(R.toUpper)(assays))}
                options={R.compose(R.map(R.evolve({text: R.toUpper})), formatList)(assays)}
                onChange={(e, { value }) => dispatch(setSelectedAssay({ value, send }))}
              />
            </Form.Field>
          </>
          }


          <Divider horizontal content='Colour By' />
          <Form.Field>
            <Form.Dropdown fluid selection labeled
              disabled = {R.test(/.*Loading/, current.value)}
              // All groups! assumes that first group is categorical (might not be true in the future)
              value={selectedGroup}
              options={isActiveResult('violin') ? formatList(categoricalGroups) : formatList(groups)}
              // options={R.addIndex(R.map)((val, index) => ({key: index, text: val, value: val}))(groups)}
              onChange={(e, {value}) => dispatch(setSelectedGroup({value, send, type: R.includes(value, categoricalGroups) ? "CHANGE_PARAMETER" : "CHANGE_GROUP_TO_NUMERIC"}))}
            />
          </Form.Field>
        <Divider horizontal content='Search Genes' />
        <Form.Group>
          <Form.Field width={12}>
            <Form.Dropdown
              disabled = {R.test(/.*Loading/, current.value) || disableGeneSelection}
              placeholder={"Enter Gene Symbol"}
              fluid
              search
              searchQuery={currentSearch}
              selection
              options={searchOptions}
              value={selectedFeature}
              onSearchChange={handleSearchChange}
              onChange={handleSelectFeature}
            />
          </Form.Field>

          <Form.Field width={4}>
            <Button 
              fluid 
              disabled={R.isNil(selectedFeature) || R.test(/.*Loading/, current.value) || disableGeneSelection} 
              icon='close' 
              color='violet' 
              onClick={() => resetSelectFeature()} 
            />
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
                    <Segment key={cluster} size='small'>
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
      </Fade>
  )
}


 export default VisualizationMenu 