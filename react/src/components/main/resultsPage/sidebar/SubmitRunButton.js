import React from 'react';

import {Button, List, Popup} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'
import {useSubmitRunMutation, useUpdateRunReferenceDatasetsMutation} from '../../../../apollo/hooks/run'

const SubmitRunButton = () => {
  const {userID, runID} = useCrescentContext()
  const {runStatus} = useResultsPage()
  const {submitRun, loading, submitted} = useSubmitRunMutation(runID)
  const {run} = useUpdateRunReferenceDatasetsMutation({runID})


  if (R.any(R.isNil, [run])) {
    return null
  }

  const {referenceDatasets} = run

  const runIsPending = R.equals('pending', runStatus)

  // const currentUserIsNotCreator = R.not(R.equals(creatorUserID, userID))
  const noReferenceDatasets = R.isEmpty(referenceDatasets)
  const disableSubmitButton = R.any(RA.isTrue, [R.not(runIsPending), submitted, loading])

  const SUBMIT_REQUIREMENTS = [
    {
      description: noReferenceDatasets ? 'Select at least one reference dataset' : `${R.length(referenceDatasets)} reference dataset(s) selected`,
      value: noReferenceDatasets,
      icon: noReferenceDatasets ? 'remove circle' : 'check circle'
    }
  ]
  const submittable = R.any(RA.isTrue, R.pluck('value', SUBMIT_REQUIREMENTS))
  return (
      <Popup
        on='hover'
        position='top center'
        inverted
        size='large'
        wide
        trigger={
          submittable ?
          <Button fluid color='blue' basic
            content={"CAN'T SUBMIT YET"}
          />
          :
          <Button fluid color='blue'
            content={runIsPending && !submitted ? 'SUBMIT RUN' : 'SUBMITTED'}
            // Check redux state of submit button, the status in run in redux, or if graphql mutation has been called
            disabled={disableSubmitButton}
            onClick={() => {
              submitRun()
            }}
          />
        }
        content={
          <List celled>
          {
            R.map(({description, value, icon}) => <List.Item {...{icon, content: description, active: value}} />, SUBMIT_REQUIREMENTS)
          }
          </List>
        }
      />
  )
}

export default SubmitRunButton
