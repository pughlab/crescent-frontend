import {useState, useEffect} from 'react'
import * as RA from 'ramda-adjunct'

import useCategoricalGroupsQuery from './useCategoricalGroupsQuery'

import {setSelectedGroup, setSelectedDiffExpression} from '../../../redux/actions/resultsPage'

import {useDispatch} from 'react-redux'
import {useResultsPage} from '../../../redux/hooks'
import { useResultsPagePlotQuery } from '../../../redux/hooks/useResultsPage'


export default function useDiffExpressionCategoricalGroups(runID, selectedDiffExpression) {
  const dispatch = useDispatch()
  const categoricalGroups = useCategoricalGroupsQuery(runID, selectedDiffExpression)

  const { activePlot } = useResultsPage()
  const { selectedGroup } = useResultsPagePlotQuery(activePlot)
  // assume groups is never empty 

  useEffect(() => {
    if (RA.isNotNil(categoricalGroups) && RA.isNilOrEmpty(selectedGroup)) {
      dispatch(setSelectedGroup({value: categoricalGroups[0]}))  
    }
  }, [categoricalGroups])

  return categoricalGroups
}

