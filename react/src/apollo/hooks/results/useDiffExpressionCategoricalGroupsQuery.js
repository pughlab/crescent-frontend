import {useState, useEffect} from 'react'

import * as RA from 'ramda-adjunct'

import useCategoricalGroupsQuery from './useCategoricalGroupsQuery'

import {setSelectedGroup} from '../../../redux/actions/resultsPage'

import {useDispatch} from 'react-redux'


export default function useDiffExpressionCategoricalGroups(runID, selectedDiffExpression) {
  const dispatch = useDispatch()
  // const diffExpression = useDiffExpressionQuery(runID)
  const categoricalGroups = useCategoricalGroupsQuery(runID, selectedDiffExpression)

  // assume groups is never empty 

  useEffect(() => {
    if (RA.isNotNil(categoricalGroups)) {
      dispatch(setSelectedGroup({value: categoricalGroups[0]}))  
    }
  }, [categoricalGroups])

  return categoricalGroups
}

