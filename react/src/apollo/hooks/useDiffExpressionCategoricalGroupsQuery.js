import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import {createUploadLink} from 'apollo-upload-client'

import {useState, useEffect} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import * as RA from 'ramda-adjunct'

// import useDiffExpressionQuery from './useDiffExpressionQuery'
import useCategoricalGroupsQuery from './useCategoricalGroupsQuery'

import {setSelectedGroup, setSelectedDiffExpression} from '../../redux/actions/resultsPage'

import {useDispatch} from 'react-redux'
import {useResultsPage} from '../../redux/hooks'
import { useResultsPagePlotQuery } from '../../redux/hooks/useResultsPage'

require('dotenv').config()
console.log(process.env.REACT_APP_GRAPHENE_URL_DEV)

const link = createUploadLink({uri: process.env.NODE_ENV === 'development'
? process.env.REACT_APP_GRAPHENE_URL_DEV
// TODO :prod url
: process.env.REACT_APP_GRAPHENE_URL_PROD})

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link
})


export default function useDiffExpressionCategoricalGroups(runID, selectedDiffExpression) {
  const dispatch = useDispatch()
  // const diffExpression = useDiffExpressionQuery(runID)
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

