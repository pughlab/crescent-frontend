import React, {useState, useEffect, useRef} from 'react';

import { Segment, Button, Transition, Divider, Step, Menu, Header, Accordion, Dropdown } from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import withRedux from '../../../../redux/hoc'

import {useMutation} from '@apollo/react-hooks'
import { gql } from 'apollo-boost'


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
    const [submitRun, {loading, data, error}] = useMutation(gql`
      mutation SubmitRun($runID: ID, $params: String) {
        submitRun(runID: $runID, params: $params) {
          runID
        }
      }
    `, {
      variables: {runID, params: JSON.stringify(parameters)}
    })
    return (
      <Button fluid content={R.equals('pending', runStatus) ? 'SUBMIT RUN' : 'ALREADY SUBMITTED'} color='blue'
        disabled={R.not(R.equals('pending', runStatus))}
        onClick={() => submitRun()}
      />
    )
  }
)

export default SubmitRunButton
