import React from 'react';

import {Accordion} from 'semantic-ui-react'
import * as R from 'ramda'

import {useDispatch} from 'react-redux'
import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'
import {useRunDetailsQuery} from '../../../../apollo/hooks/run'
import {setActiveDataAction} from '../../../../redux/slices/resultsPage'

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

export default function DataSidebar () {    
  const {userID: currentUserID, runID} = useCrescentContext()

  const {run} = useRunDetailsQuery(runID)

  if (R.any(R.isNil, [run])) {
    return null
  }
  const {datasets} = run
  const isSingleDatasetRun = R.compose(R.equals(1), R.length)(datasets)

  const DATA_ACTIONS = [
    ... isSingleDatasetRun ? [] : [{dataAction: 'referenceDatasets', label: 'Select Reference Datasets', description: 'Select which datasets will be used as reference/anchors'}],
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