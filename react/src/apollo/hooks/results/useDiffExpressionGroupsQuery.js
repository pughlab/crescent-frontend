import {useState, useEffect} from 'react'
import * as RA from 'ramda-adjunct'

import useAvailableGroupsQuery from './useAvailableGroupsQuery'

import {setSelectedGroup} from '../../../redux/actions/resultsPage'

import {useDispatch} from 'react-redux'

export default function useDiffExpressionGroups(runID, selectedDiffExpression) {
  const dispatch = useDispatch()
  // const diffExpression = useDiffExpressionQuery(runID)
  const groups = useAvailableGroupsQuery(runID, selectedDiffExpression)

  // assume groups is never empty 

  useEffect(() => {
    if (RA.isNotNil(groups)) {
      dispatch(setSelectedGroup({value: groups[0]}))  
    }
  }, [groups])

  return groups
}

