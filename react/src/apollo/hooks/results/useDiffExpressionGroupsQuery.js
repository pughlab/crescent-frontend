import {useState, useEffect} from 'react'

import * as RA from 'ramda-adjunct'

import useAvailableGroupsQuery from './useAvailableGroupsQuery'

import {setSelectedGroup, setSelectedDiffExpression} from '../../../redux/actions/resultsPage'

import {useDispatch} from 'react-redux'
import { useResultsPage } from '../../../redux/hooks'
import { useResultsPagePlotQuery } from '../../../redux/hooks/useResultsPage'


export default function useDiffExpressionGroups(runID, selectedDiffExpression) {
  const dispatch = useDispatch()
  const groups = useAvailableGroupsQuery(runID, selectedDiffExpression)

  const { activePlot } = useResultsPage()
  const { selectedGroup } = useResultsPagePlotQuery(activePlot)
  // assume groups is never empty 

  useEffect(() => {
    if (RA.isNotNil(groups) && RA.isNilOrEmpty(selectedGroup)) {
      dispatch(setSelectedGroup({value: groups[0]}))  
    }
  }, [groups])

  return groups
}

