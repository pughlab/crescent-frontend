import React, {useState, useEffect, useRef} from 'react';

import { Loader, Segment, Button, Transition, Divider, Step, Menu, Header, Accordion, Dropdown } from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useDispatch} from 'react-redux'
import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'
import {useRunDetailsQuery, useSubmitRunMutation} from '../../../../apollo/hooks'
import {setIsSubmitted} from '../../../../redux/actions/resultsPage'

import {useMutation, useQuery} from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import {queryIsNotNil} from '../../../../utils'
import useRunLogsQuery from '../../../../apollo/hooks/useRunLogsQuery';



const LogsComponent = ({
}) => {
  const {userID, runID} = useCrescentContext()

  // const dispatch = useDispatch()
  // const {isSubmitted} = useResultsPage()

  // const run = useRunDetailsQuery(runID)
  const {logs} = useRunLogsQuery(runID)

  if (R.any(R.isNil, [logs])) {
    return null
  }

  return (
    <div>
        {logs}
        </div>
  )
}

export default LogsComponent
