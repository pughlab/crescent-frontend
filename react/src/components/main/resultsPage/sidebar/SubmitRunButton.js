import React from 'react';

import {Button, List, Popup, Message} from 'semantic-ui-react'

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

  const {parameters: {quality}, datasets, referenceDatasets, datasetIDs} = run

  //Summing downsampled values with numCells
  const datasetNumCells = R.reduce((numCellsByDatasetID, {datasetID, numCells}) => R.assoc(datasetID, numCells, numCellsByDatasetID), {}, datasets)

  const downsampledCells =  R.compose(
    R.mapObjIndexed((downsample, datasetID, obj) => downsample <= 0 ? datasetNumCells[datasetID] : downsample),
    R.pluck('downsample')
  )(quality)
  
  const downsampledCellsSum = R.sum(R.values(downsampledCells))


  const runIsPending = R.equals('pending', runStatus)

  // const currentUserIsNotCreator = R.not(R.equals(creatorUserID, userID))
  const noReferenceDatasets = R.isEmpty(referenceDatasets)
  const disableSubmitButton = R.any(RA.isTrue, [R.not(runIsPending), submitted, loading])
  const totalCells = R.sum(R.pluck('numCells')(datasets)) // calculating total raw cells
  const limit = 100000 // limit of cells allowed
  const isUnderLimit = R.lte(downsampledCellsSum, limit)

  const SUBMIT_REQUIREMENTS = [
    {
      //Ready to submit output if cells are under the limit, and have a reference dataset selected
      description: isUnderLimit && !noReferenceDatasets ? 
      <Message
        success
        color = 'blue'
        content='Ready to submit'
        list={[

      //the following conditional rendering occurs depending on if a user selects a reference dataset or not 
      noReferenceDatasets ? 'Select at least one reference dataset' : `${R.length(referenceDatasets)} reference dataset(s) selected, with
      ${totalCells} total cells `,

      //the following conditional rendering occurs depending on if the cells are above or below the limit
      isUnderLimit ? `There are ${downsampledCellsSum} total downsampled cells, under the limit of ${limit} cells` : `Cells are above the limit of ${limit}, please downscale.
      Your current number of total downsampled cells is ${downsampledCellsSum}`,
  ]}
      /> :
      //If there are either a number of cells above the limit or a reference dataset not selected, the following message will show up
      <Message
        error
        color = 'red'
        content ='There was some errors with your submission, at least one of the listed items are missing '
        list={[

      //the following conditional rendering occurs depending on if a user selects a reference dataset or not 
      noReferenceDatasets ? 'Select at least one reference dataset' : `${R.length(referenceDatasets)} reference dataset(s) selected, with
      ${totalCells} total cells `,

      //the following conditional rendering occurs depending on if the cells are above or below the limit
      isUnderLimit ? `There are ${downsampledCellsSum} total downsampled cells, under the limit of ${limit} cells` : `Cells are above the limit of ${limit}, please downscale.
      Your current number of total downsampled cells is ${downsampledCellsSum}`,
  ]}
      />,

      value: noReferenceDatasets,
      icon: isUnderLimit && !noReferenceDatasets ? 'check circle' : 'remove circle'
    }
  ]
  //For a project to be submittable, it must be under the limit of cells, and have selected at least one reference dataset
  const submittable = isUnderLimit && !noReferenceDatasets
  return (
      <Popup
        on='hover'
        position='top center'
        inverted
        size='large'
        wide
        trigger={
          !submittable ?
          <Button fluid color='red' basic
            content={`CAN'T SUBMIT YET (${downsampledCellsSum} / ${limit} cells)` }
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
