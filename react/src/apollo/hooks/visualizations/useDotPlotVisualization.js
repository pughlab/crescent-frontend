import React, { useState, useEffect } from 'react'

import * as R from 'ramda'

import { useDispatch } from 'react-redux'
import { useCrescentContext, useResultsPage } from '../../../redux/hooks'
import { useResultsPagePlotQuery } from '../../../redux/hooks/useResultsPage'
import { useResultsAvailableQuery, useDotPlotQuery } from '../../hooks'
import { addSelectedFeature, setSelectedScaleBy, setSelectedExpRange } from '../../../redux/actions/resultsPage'

export default function useDotPlotVisualization(plotQueryIndex, dotPlotData){
    const { runID } = useCrescentContext()

    const dispatch = useDispatch()
    const { activeResult, selectedFeatures, selectedGroup, selectedScaleBy, selectedExpRange } = useResultsPagePlotQuery(plotQueryIndex)
    const { sidebarCollapsed } = useResultsPage()
    const plots = useResultsAvailableQuery(runID)
    const [resetSliderValues, setResetSliderValues] = useState(true)    
  
    let dotPlot = [] //list of dot plot plotly object
    let queryGenes = [] //list of genes to send along the query
  
    // for all the selected genes, if cached and in the selected group then add to dotPlot, 
    // else need to include in query
    R.forEach((gene) => {
      if (R.includes(gene, Object.keys(dotPlotData)) 
        && dotPlotData[gene]["group"] === selectedGroup
        && dotPlotData[gene]["scaleby"] === selectedScaleBy
        && selectedScaleBy === "gene") {
        dotPlot = R.append(dotPlotData[gene], dotPlot)
      } else {
        queryGenes = R.append(gene, queryGenes)
      }
    }, selectedFeatures)
    const queryResult = useDotPlotQuery(queryGenes, selectedGroup, runID, selectedScaleBy, selectedExpRange)
    const result = queryResult === null ? [] : queryResult.filter(trace => trace["group"] === selectedGroup && trace["scaleby"] === selectedScaleBy)
    dotPlot = R.concat(dotPlot, result)
  
  
    useEffect(() => {
      if((R.not(R.isNil(queryResult) || R.isEmpty(queryResult))) && resetSliderValues){
        const initialRange = queryResult[0]["initialminmax"].map(num => Math.round(num * 10) / 10)
        if(R.not(R.equals(selectedExpRange, initialRange))){
          dispatch(setSelectedExpRange({value: initialRange}))
          setResetSliderValues(false)
        }
      }
    }, [queryResult])
  
    useEffect(() => { // when selected features change, reset the default slider value
      setResetSliderValues(true)
    }, [selectedFeatures])
  
    useEffect(() => { // when sidebarCollapsed changes, the selectedFeatures will get reset, so need to set state to false
      setResetSliderValues(false)
    }, [sidebarCollapsed])


    let status = "finished" // possible statuses: "finished", "unavailable", "loading", "selecting"
    if (R.any(R.isNil, [plots])) {
        status = "unavailable"
    }else if (R.isNil(queryResult) || (R.not(R.equals(queryGenes, ["none"])) && R.isEmpty(dotPlot))) {
        status = "loading"
    }else if (R.equals(selectedFeatures, ["none"])|| R.isEmpty(selectedFeatures)) {
        status = "selecting"
    }

    // determine proper name of active plot
    const plotName = R.equals(status, "finished") ?  R.compose(R.prop('label'), R.find(R.propEq('result', activeResult)))(plots) : ''

    // determine the max of the slider
    const possibleMaxExp = R.not(R.isEmpty(result)) ? Math.ceil(result[0]["globalmax"]*10)/10 : 100
    return {
        plotData: {
            plotName, 
            dotPlot,
            possibleMaxExp, 
        },
        status: status,
        reduxActions: {
            dispatch, 
            setSelectedExpRange,
            setSelectedScaleBy
        },
        reduxStates: {
            sidebarCollapsed, 
            selectedScaleBy, 
            selectedExpRange,
        },
    }
}