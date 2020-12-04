import React, {useState, useEffect } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Button, Form, Divider, Segment, Popup, Label } from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useDispatch} from 'react-redux'
import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'
import {useResultsPagePlotQuery} from '../../../../redux/hooks/useResultsPage'
import {useDiffExpressionQuery, useDiffExpressionGroupsQuery, useTopExpressedQuery, useSearchFeaturesQuery, useDiffExpressionCategoricalGroupsQuery} from '../../../../apollo/hooks'
import {addSelectedFeature, removeSelectedFeature, setSelectedGroup, setSelectedDiffExpression} from '../../../../redux/actions/resultsPage'

const DotPlotVisualizationMenu = ({
}) => { 
  // const {changeActiveGroup, changeSelectedFeature} = reduxThunks
  const [currentSearch, setCurrentSearch] = useState('')
  const [currentOptions, setCurrentOptions] = useState([])
  
  const {runID} = useCrescentContext()
  const dispatch = useDispatch()

  const {activePlot} = useResultsPage()
  const {activeResult, selectedFeatures, selectedGroup, selectedDiffExpression} = useResultsPagePlotQuery(activePlot)
  const isActiveResult = R.equals(activeResult)

  //available groups & top expressed must be queries
  const diffExpression = useDiffExpressionQuery(runID)
  
  // const groups = useAvailableGroupsQuery(runID, selectedDiffExpression)

  const groups = useDiffExpressionGroupsQuery(runID, selectedDiffExpression)
  const categoricalGroups = useDiffExpressionCategoricalGroupsQuery(runID, selectedDiffExpression)
  // const categoricalGroups = useCategoricalGroupsQuery(runID)

  const topExpressed = useTopExpressedQuery(runID, selectedDiffExpression)
  const searchOptions = useSearchFeaturesQuery(currentSearch, runID)

  const maxNumGenes = 20

  // useEffect(() => {
  //   setCurrentSearch(selectedFeature || '')
  // }, [selectedFeature])

  if (R.any(R.isNil, [diffExpression, groups, categoricalGroups, topExpressed, searchOptions])) {
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

  const handleSelectFeature = (e, {value}) => {
    if (R.not(R.includes(value, selectedFeatures))){
      if(R.length(selectedFeatures) < maxNumGenes){
        dispatch(addSelectedFeature({value}))
      }
        
    }
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
            basic={R.not(R.includes(gene, selectedFeatures))}
            disabled={R.length(selectedFeatures) >= maxNumGenes}
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
          disabled
        />
      </Form.Field>

      <Divider horizontal content='Datasets Type' />
      <Form.Field>
        <Form.Dropdown fluid selection labeled
          value="raw"
          options={[{key: "raw", text: "Raw", value: "raw"}, {key: "normalized", text: "Normalized", value: "normalized"}]}
          onChange={(e, {value}) => {}}
          disabled
        />
      </Form.Field>

      <Divider horizontal content='Colour By' />
      <Form.Field>
        <Form.Dropdown fluid selection labeled
          // All groups! assumes that first group is categorical (might not be true in the future)
          value={selectedGroup}
          options={isActiveResult('violin') ? formatList(categoricalGroups) : formatList(groups)}
          // options={R.addIndex(R.map)((val, index) => ({key: index, text: val, value: val}))(groups)}
          onChange={(e, {value}) => dispatch(setSelectedGroup({value}))}
          disabled
        />
      </Form.Field>

      <Divider horizontal>
        Selected Genes (Max 20)
      </Divider>
      <Segment size='small' >
        {
          R.map(
            (feature) => { 
              if(R.equals(feature, "none")) return <></>
              return(
              <Button 
                key={feature}
                content={feature} 
                style={{margin: '0.25rem'}} 
                icon='close' 
                size='tiny' 
                labelPosition='right'
                color='violet' 
                basic
                onClick={()=> {
                  dispatch(removeSelectedFeature({value: feature}))
                }}
              />
              )},(selectedFeatures)
          )
        }
        <Button 
          content="Unselect all" 
          fluid
          style={{margin: '0.25rem'}} 
          size="small" 
          color='violet'
          onClick={()=> {
            R.forEach((feature)=>{
              dispatch(removeSelectedFeature({value: feature}))
            }, selectedFeatures)
            dispatch(addSelectedFeature({value: "none"}))
          }}
        />
      </Segment>

      <Divider horizontal content='Search Genes' />
      <Form.Group>
        <Form.Field width={16}>
          <Form.Dropdown
            placeholder={"Enter Gene Symbol"}
            fluid
            search
            searchQuery={currentSearch}
            selection
            options={searchOptions}
            onSearchChange={handleSearchChange}
            onChange={handleSelectFeature}
            disabled={R.length(selectedFeatures) >= maxNumGenes}
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
  )
}


 export default DotPlotVisualizationMenu 