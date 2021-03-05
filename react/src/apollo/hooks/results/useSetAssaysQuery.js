import {useState, useEffect} from 'react'

import * as RA from 'ramda-adjunct'

import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import {grapheneClient as client} from '../../clients'

import {useDispatch} from 'react-redux'
import { useResultsPage } from '../../../redux/hooks'
import { useResultsPagePlotQuery } from '../../../redux/hooks/useResultsPage'

import {setSelectedAssay} from '../../../redux/actions/resultsPage'

import useAvailableAssaysQuery from './useAvailableAssaysQuery'

export default function useSetAssays(runID) {
  const dispatch = useDispatch()
  const { activePlot } = useResultsPage()
  const { selectedAssay } = useResultsPagePlotQuery(activePlot)

  const assays = useAvailableAssaysQuery(runID)
  // assume assays is never empty 

  useEffect(() => {
    if (RA.isNotNil(assays) && RA.isNilOrEmpty(selectedAssay)) {
      dispatch(setSelectedAssay({value: assays[0]}))  
    }
  }, [assays])

  return assays
}

