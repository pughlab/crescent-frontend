import {useState, useEffect} from 'react'

import * as RA from 'ramda-adjunct'

import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import {grapheneClient as client} from '../../clients'

import {useDispatch} from 'react-redux'
import { useResultsPage } from '../../../redux/hooks'
import { useResultsPagePlotQuery } from '../../../redux/hooks/useResultsPage'

import {setSelectedAssay} from '../../../redux/slices/resultsPage'


export default function useAvailableAssays(runID) {
  const dispatch = useDispatch()
  const { activePlot } = useResultsPage()
  const { selectedAssay } = useResultsPagePlotQuery(activePlot)

  const [assays, setAvailableAssays] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query Assays($runID: ID) {
      assays(runID: $runID)
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {runID},
    onCompleted: ({assays}) => {
      setAvailableAssays(assays)
    }
  })

  return assays
}

