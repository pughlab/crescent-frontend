import React, { useState, useEffect, useRef } from 'react';

import { Loader, Segment, Button, Transition, Divider, Step, Menu, Header, Accordion, Dropdown, Checkbox } from 'semantic-ui-react'

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
  const [showVerbose, setShowVerbose] = useState(false)

  const { userID, runID } = useCrescentContext()

  const { logs, loading } = useRunLogsQuery(runID)


  const splitByNewLine = R.compose(R.map(R.trim), R.split('\n'))
  const includesNumOfAsterisks  = R.compose(R.includes, RA.concatAll, R.repeat('*'))
  const trimUnicode = str => str.substring(R.indexOf('*')(str))
  const mapToParagraph = R.addIndex(R.map)((comment, index) => <p key={index}>{comment}</p>)

  // R.compose(R.join('<br>'), R.map(trimUnicode), filterByHasAsterisks, splitByNewLine)(logs)
  if (loading) return '...';
  return (
    <>
      <Divider horizontal>
        <Header>
          Logs
          <Header.Subheader>
            <Checkbox label='Show verbose logs' onClick={() => setShowVerbose(!showVerbose)} />
          </Header.Subheader>
        </Header>
      </Divider>
      <Segment style={{height: '100%', overflowY: 'auto', maxHeight: '60vh'}}>
        
      {
        R.either(R.isNil, R.isEmpty)(logs) ? (
          <>No Logs Available</>
        ) : (
          <>
          {
            R.compose(
              mapToParagraph,
              R.map(trimUnicode),
              R.filter(includesNumOfAsterisks(showVerbose ? 3 : 4)),
              splitByNewLine
            )(logs)
          }
          </>
        )
      }
      </Segment>
    </>
  )
}

export default LogsComponent
