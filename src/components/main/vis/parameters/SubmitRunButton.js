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
            parameters,
            isSubmitted
          }
        }
      },
    },
    actions: {
      setIsSubmitted
    }
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

    const runIsNotPending = R.not(R.equals('pending', runStatus))
    const runSubmitted = R.or(
      loadingSubmitRun,
      queryIsNotNil('submitRun', dataSubmitRun)
    )
    return (
      <Button fluid content={R.equals('pending', runStatus) ? 'SUBMIT RUN' : 'ALREADY SUBMITTED'} color='blue'
        // Check redux state of submit button, the status in run in redux, or if graphql mutation has been called
        disabled={R.any(RA.isTrue, [isSubmitted, runIsNotPending, runSubmitted])}
        onClick={() => {
          setIsSubmitted(true)
          submitRun()
        }}
      />
    )
  }
)

export default SubmitRunButton
