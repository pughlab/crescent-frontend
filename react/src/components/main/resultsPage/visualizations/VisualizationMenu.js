import React, {useState, useEffect } from 'react'
import Plot from 'react-plotly.js'
import { Button, Form, Divider, Segment, Popup, Label, Icon, Header, Grid } from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useDispatch} from 'react-redux'
import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'
import {useResultsPagePlotQuery} from '../../../../redux/hooks/useResultsPage'
import {useDiffExpressionQuery, useDiffExpressionGroupsQuery, useTopExpressedQuery, useSearchFeaturesQuery, useDiffExpressionCategoricalGroupsQuery, useSetAssaysQuery} from '../../../../apollo/hooks/results'
import {setSelectedFeature, setSelectedGroup, setSelectedDiffExpression, setSelectedAssay} from '../../../../redux/actions/resultsPage'

const VisualizationMenu = ({
}) => { 
  // const {changeActiveGroup, changeSelectedFeature} = reduxThunks
  const [currentSearch, setCurrentSearch] = useState('')
  const [currentOptions, setCurrentOptions] = useState([])
  
  const {runID} = useCrescentContext()
  const dispatch = useDispatch()

  // console.log("use results: ", useResultsPage())
  const {activePlot} = useResultsPage()
  const {activeResult, selectedFeature, selectedGroup, selectedDiffExpression, selectedAssay} = useResultsPagePlotQuery(activePlot)
  const isActiveResult = R.equals(activeResult)
  const isActiveAssay = R.equals(selectedAssay)

  //available groups & top expressed must be queries
  const diffExpression = useDiffExpressionQuery(runID)
  
  // const groups = useAvailableGroupsQuery(runID, selectedDiffExpression)

  const groups = useDiffExpressionGroupsQuery(runID, selectedDiffExpression)
  const categoricalGroups = useDiffExpressionCategoricalGroupsQuery(runID, selectedDiffExpression)
  // const categoricalGroups = useCategoricalGroupsQuery(runID)

  const assays = useSetAssaysQuery(runID)

  const topExpressed = useTopExpressedQuery(runID, selectedDiffExpression, selectedAssay)
  const searchOptions = useSearchFeaturesQuery(currentSearch, runID, selectedAssay)


  useEffect(() => {
    setCurrentSearch(selectedFeature || '')
  }, [selectedFeature])

  if (R.any(R.isNil, [diffExpression, groups, categoricalGroups, topExpressed, searchOptions, assays])) {
    return null
  }

  const handleSearchChange = (event, {searchQuery}) => {
    // console.log("SEARCH QUERY", searchQuery)
    // console.log("CURR OPTION", currentOptions)
    // console.log("CURR SEARCH", currentSearch)
    setCurrentSearch(searchQuery)
    if (RA.isNotEmpty(searchQuery)) {
      setCurrentOptions(searchOptions)
    }
  }

  const handleSelectFeature = (e, {value}) => dispatch(setSelectedFeature({value}))

  const resetSelectFeature = () => {
    setCurrentSearch('')
    setCurrentOptions([])
    dispatch(setSelectedFeature({value: null}))
  }

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

  const formatList = R.addIndex(R.map)((val, index) => ({key: index, text: val, value: val}))
  
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

        {!isActiveAssay('legacy') && 
        <>
          <Divider horizontal content='RNA Normalization' />
          <Form.Field>
            <Form.Dropdown fluid selection labeled
              value={selectedAssay}
              // options={formatList(R.map(R.toUpper)(assays))}
              options={R.compose(R.map(R.evolve({text: R.toUpper})), formatList)(assays)}
              onChange={(e, { value }) => dispatch(setSelectedAssay({ value }))}
            />
          </Form.Field>
        </>
        }


        <Divider horizontal content='Colour By' />
        <Form.Field>
          <Form.Dropdown fluid selection labeled
            // All groups! assumes that first group is categorical (might not be true in the future)
            value={selectedGroup}
            options={isActiveResult('violin') ? formatList(categoricalGroups) : formatList(groups)}
            // options={R.addIndex(R.map)((val, index) => ({key: index, text: val, value: val}))(groups)}
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
            options={searchOptions}
            value={selectedFeature}
            onSearchChange={handleSearchChange}
            onChange={handleSelectFeature}
          />
        </Form.Field>

        <Form.Field width={4}>
           <Button fluid disabled={R.isNil(selectedFeature)} icon='close' color='violet' onClick={() => resetSelectFeature()} />
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