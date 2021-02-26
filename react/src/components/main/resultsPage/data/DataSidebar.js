import React, {useState, useEffect, useRef} from 'react';

import { Segment, Button, Icon, Step, Header, Modal, Dropdown, Form, Divider, Menu, Accordion } from 'semantic-ui-react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useDispatch} from 'react-redux'
import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'
import {useRunDetailsQuery} from '../../../../apollo/hooks/run'
import {setActiveDataAction} from '../../../../redux/actions/resultsPage'

const DataAccordionItem = ({dataAction, label, description}) => {
  const dispatch = useDispatch()
  const {activeDataAction} = useResultsPage()
  const active = R.equals(dataAction, activeDataAction)
  return (
    <>
    <Accordion.Title {...{active, onClick: () => dispatch(setActiveDataAction({dataAction}))}}>
      {label}
    </Accordion.Title>
    <Accordion.Content>
      {description}
    </Accordion.Content>
    </>
  )
}

export default function DataSidebar ({

}) {    
  const {userID: currentUserID, runID} = useCrescentContext()

  const run = useRunDetailsQuery(runID)

  const dispatch = useDispatch()

  if (R.any(R.isNil, [run])) {
    return null
  }
  const {datasets} = run
  const isSingleDatasetRun = R.compose(R.equals(1), R.length)(datasets)

  const DATA_ACTIONS = [
    ... isSingleDatasetRun ? [] : [{dataAction: 'referenceDatasets', label: 'Reference Datasets', description: 'Select which datasets will be used as reference/anchors'}],
    {dataAction: 'runMetadata', label: 'Run Metadata', description: 'Upload/replace metadata for this run'},
  ]

  return (
    <>
    <Accordion styled>
    {
      R.map(
        (action) => (<DataAccordionItem key={action.dataAction} {...{...action}} />
        ),
        DATA_ACTIONS
      )
    }
    </Accordion>
    </>
  )
}