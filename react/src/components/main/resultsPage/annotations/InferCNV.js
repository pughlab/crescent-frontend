import React, {useEffect, useState} from 'react'
import {useActor} from '@xstate/react'
import {Image, Grid, Segment} from 'semantic-ui-react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import Tada from 'react-reveal/Tada'
import Logo from '../../../login/logo.jpg'

import {useAnnotations} from '../../../../redux/hooks'

import {useSubmitInferCNVMutation, useSampleAnnotsQuery, useUpdateNormalCellTypesMutation, useUploadGenePosMutation, useUploadSampleAnnotsMutation} from '../../../../apollo/hooks/run'

import UploadSampleAnnotsButton from './UploadSampleAnnotsButton'
import UploadGenePosButton from './UploadGenePosButton'
import AddNormalCellTypesButton from './AddNormalCellTypesButton'

import SecondaryRunLogs from '../logs/SecondaryRunLogs'
import AnnotationsSecondaryRuns, {NoSecondaryRuns} from './AnnotationsSecondaryRuns'

export default function InferCNV({ runID }) {
  const {annotationsService: service} = useAnnotations()
  // const {userID: currentUserID} = useCrescentContext()
  const {refetchSampleAnnots, sampleAnnots} = useSampleAnnotsQuery(runID)
  const uploadSampleAnnots = useUploadSampleAnnotsMutation(runID)
  const updateNormalCellTypes = useUpdateNormalCellTypesMutation(runID)
  const uploadGenePos = useUploadGenePosMutation(runID)
  const {submitInferCNV, run} = useSubmitInferCNVMutation(runID)
  const [secondaryRuns, setSecondaryRuns] = useState(null)
  const [currSampleAnnots, setCurrSampleAnnots] = useState(null)

	const annotationType = 'InferCNV'

  const [{context: {secondaryRunWesID}, matches}, send] = useActor(service)
  const secondaryRunSubmitted = matches('secondaryRunSubmitted')

  useEffect(() => {
    send({
      type: 'ANNOTATION_TYPE_INIT',
      annotationType,
      // The predicates that the respective input must satisfy before the secondary run can be submitted
      inputConditions: [
        R.both(RA.isNotNil, RA.isNonEmptyArray),
        R.both(RA.isNotNil, RA.isNonEmptyArray),
        RA.isNotNil
      ],
      // Labels for input upload status checklist
      inputChecklistLabels: [
        'Sample annotation file (.txt format)',
        'Normal cell type selection',
        'Gene/chromosome position file (.txt format)'
      ],
      // Submission function for the secondary run
      submitFunction: submitInferCNV,
      // Function for uploading/handling the respective input
      // NOTE: each must be a function (the function will be passed uploadOptions)
      // that returns a promise that resolves with the upload results in the form of {data: results} 
      // (which will then verified with the respective input condition)
      uploadFunctions: [
        // inputIndex: 0 - sample annotation file upload or retrieving previously upload sample annotations
        uploadOptions => new Promise(async resolve => {
          const {type, variables} = uploadOptions

          // Clear the normal cell types from the previous InferCNV secondary run
          await updateNormalCellTypes({variables: {normalCellTypes: []}})
          // Upload the sample annots file
          // (only if the user uploaded a sample annots file vs. choosing to use the previously uploaded sample annots file)
          if (type === 'newUpload') await uploadSampleAnnots({...{variables}})
          // Refetch and set the current sample annots
          const {data: {sampleAnnots: sampleAnnotsResults}} = await refetchSampleAnnots()
          
          if (RA.isNotNil(sampleAnnotsResults)) setCurrSampleAnnots(sampleAnnotsResults)

          resolve({data: RA.isNotNil(sampleAnnotsResults) ? sampleAnnotsResults : null})
        }),
        // inputIndex: 1 - normal cell type update
        uploadOptions => new Promise(async resolve => {
          const {variables: {normalCellTypes: value}} = uploadOptions
          const {data: {updateNormalCellTypes: updateNormalCellTypesResults}} = await updateNormalCellTypes(uploadOptions)

          resolve(updateNormalCellTypesResults ? {data: value} : null)
        }),
        // inputIndex: 2 - gene position file upload
        uploadGenePos
      ]
    })
  }, [send, refetchSampleAnnots, submitInferCNV, updateNormalCellTypes, uploadGenePos, uploadSampleAnnots])

  useEffect(() => {
    if (RA.isNotNil(run)) {
      const {secondaryRuns: secondaryRunsFromQuery} = run
      setSecondaryRuns(secondaryRunsFromQuery)
    }
  }, [run])

  useEffect(() => {
    if (!secondaryRunSubmitted) setCurrSampleAnnots(null)
  }, [secondaryRunSubmitted])

  if (R.isNil(run)) {
    return (
      <Segment
        basic
        placeholder
        style={{ height: '100%' }}
      >
        <Tada forever duration={1000}>
          <Image
            centered
            size="medium"
            src={Logo}  
          />
        </Tada>
      </Segment>
    )
  }

  // const {status: runStatus, name: runName, createdBy: {userID: creatorUserID}} = run
  // const disabledUpload = R.not(R.equals(currentUserID, creatorUserID))

  return (
    <>
      { R.isNil(secondaryRunWesID) ? (
        <Grid>
          <Grid.Row>
            <Grid.Column>
              <UploadSampleAnnotsButton {...{sampleAnnots}} />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <AddNormalCellTypesButton {...{sampleAnnots: currSampleAnnots}} />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <UploadGenePosButton />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      ) : (
        <SecondaryRunLogs />
      )}
      { R.isNil(secondaryRuns) ? (
        <NoSecondaryRuns {...{annotationType}} />
      ) : (
        <AnnotationsSecondaryRuns {...{annotationType, secondaryRuns}} />
      )}
    </>
  )
}