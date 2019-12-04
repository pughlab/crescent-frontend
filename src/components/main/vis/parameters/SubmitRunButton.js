import React, {useState, useEffect, useRef} from 'react';

import { Segment, Button, Transition, Divider, Step, Menu, Header, Accordion, Dropdown } from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import withRedux from '../../../../redux/hoc'

import {useMutation, useQuery} from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import {queryIsNotNil} from '../../../../utils'



const SubmitRunButton = withRedux(
  ({
    app: {
      run: {
        runID,
        status: runStatus
      },
      toggle: {
        vis: {
          pipeline: {
            parameters
          }
        }
      },
    },
    actions: {}
  }) => {
    const [submitRun, {loading: loadingSubmitRun, data: dataSubmitRun, error}] = useMutation(gql`
      mutation SubmitRun($runID: ID, $params: String) {
        submitRun(runID: $runID, params: $params) {
          runID
        }
      }
    `, {
      variables: {runID, params: JSON.stringify(parameters)}
    })
    const {loading: loadingRun, data: dataRun, error: errorRun} = useQuery(gql`
      query Run($runID: ID) {
        run(runID: $runID) {
          runID
          status
        }
      }
    `, {
      variables: {runID}, 
      fetchPolicy: 'network-only'
    })
    console.log(dataRun)
    const runPreviouslySubmitted = R.ifElse(
      queryIsNotNil('run'),
      R.compose(R.not, R.propEq('status', 'pending'), R.prop('run')),
      R.F
    )(dataRun)
    const runIsNotPending = R.not(R.equals('pending', runStatus))
    const runSubmitted = R.or(
      loadingSubmitRun,
      queryIsNotNil('submitRun', dataSubmitRun)
    )
    console.log([loadingRun, runPreviouslySubmitted, runIsNotPending, runSubmitted])
    return (
      <Button fluid content={R.equals('pending', runStatus) ? 'SUBMIT RUN' : 'ALREADY SUBMITTED'} color='blue'
        disabled={R.any(RA.isTrue, [runPreviouslySubmitted, runIsNotPending, runSubmitted])}
        onClick={() => submitRun()}
      />
    )
  }
)

export default SubmitRunButton
