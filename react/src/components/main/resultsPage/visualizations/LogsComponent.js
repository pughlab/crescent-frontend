import React, { useState, useEffect, useRef } from 'react';

import { Loader, Segment, Button, Transition, Divider, Step, Menu, Header, Accordion, Dropdown } from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { useDispatch } from 'react-redux'
import { useCrescentContext, useResultsPage } from '../../../../redux/hooks'
import { useRunDetailsQuery, useSubmitRunMutation } from '../../../../apollo/hooks'
import { setIsSubmitted } from '../../../../redux/actions/resultsPage'

import { useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import { queryIsNotNil } from '../../../../utils'
import useRunLogsQuery from '../../../../apollo/hooks/useRunLogsQuery';

import Fade from 'react-reveal/Fade';



const LogsComponent = ({
}) => {
  const { userID, runID } = useCrescentContext()

  const { logs, loading } = useRunLogsQuery(runID)
  const splitByNewLine = R.compose(R.map(R.trim), R.split('\n'))
  const filterByHasAsterisks = R.filter(R.includes('***'))
  const trimUnicode = str => str.substring(R.indexOf('*')(str))
  const mapToParagraph = R.addIndex(R.map)((comment, index) => <p key={index}>{comment}</p>)

  // R.compose(R.join('<br>'), R.map(trimUnicode), filterByHasAsterisks, splitByNewLine)(logs)

  return (
    loading ?
      <Fade>
      </Fade>
    : R.equals(null, logs) ?
      <Fade left>
        No Logs Available
      </Fade> 
    :
      <Fade left>
        {R.compose(mapToParagraph, R.map(trimUnicode), filterByHasAsterisks, splitByNewLine)(logs)}
      </Fade> 
  )
}

export default LogsComponent
