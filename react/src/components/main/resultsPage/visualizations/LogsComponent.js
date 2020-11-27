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

import Typewriter from 'typewriter-effect';



const LogsComponent = ({
}) => {
  const {userID, runID} = useCrescentContext()

  // const dispatch = useDispatch()
  // const {isSubmitted} = useResultsPage()

  // const run = useRunDetailsQuery(runID)
  const {logs} = useRunLogsQuery(runID)
  const splitByNewLine = R.compose(R.map(R.trim), R.split('\n'))
  const filterByHasAsterisks = R.filter(R.includes('***'))
  const trimUnicode = str => {return str.substring(R.indexOf('*')(str))}
  const mapToParagraph = R.addIndex(R.map)((comment, index) => <p key={index}>{comment}</p>)
  const mapToTypewriter = R.addIndex(R.map)((comment, index) => 
    <Typewriter key={index}
      options={{
        strings: comment,
        autoStart: true,
        loop: false,
    }}
    />
  );
  if (R.any(R.isNil, [logs])) {
    return null
  }

  return (
     /* <Typewriter
    options={{
      strings: R.compose(R.map(trimUnicode), filterByHasAsterisks, splitByNewLine)(logs),
      autoStart: true,
      loop: true,
    }}
    /> */
    <>
      {R.compose(mapToTypewriter, R.map(trimUnicode), filterByHasAsterisks, splitByNewLine)(logs)}
    </>
  )
}

export default LogsComponent
