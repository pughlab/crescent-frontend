import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import {createUploadLink} from 'apollo-upload-client'

import {useState, useEffect} from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as RA from 'ramda-adjunct'
import * as R from 'ramda'

import {useRunDetailsQuery} from './useRunDetailsQuery'

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

export default function useSubmitRunMutation(runID) {
  // const run = useRunDetailsQuery(runID)

  const [runStatus, setRunStatus] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query RunStatus($runID: ID) {
      run(runID: $runID) {
        status
      }
    }
  `, {
    variables: {
      runID
    },
    onCompleted: ({run: {status}}) => {
      setRunStatus(status)
    }
  })

  const [submitRun, {loading: loadingSubmitRun}] = useMutation(gql`
    mutation SubmitRun($runID: ID) {
      submitRun(runId: $runID) {
        wesID
      }
    }
  `, {
    client,
    variables: {runID},    
    onCompleted: ({submitRun: {wesID}}) => {
      if (wesID != null)
        setRunStatus('submitted')
    }
  })

  return {submitRun, runStatus, loadingSubmitRun}
}