import React, {useEffect, useState} from 'react'
import {useActor} from '@xstate/react'
import {Image, Grid, Segment} from 'semantic-ui-react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import Tada from 'react-reveal/Tada'
import Logo from '../../../login/logo.jpg'

import {useAnnotations} from '../../../../redux/hooks'
import {useSecondaryRunEvents} from '../../../../redux/helpers/machines/SecondaryRunMachine/useSecondaryRunMachine'

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
  const [normalCellTypes, setNormalCellTypes] = useState([])
  const {annotationTypeInit, uploadInput} = useSecondaryRunEvents()

	const annotationType = 'InferCNV'

  const [{value}] = useActor(service)
  const secondaryRunSubmitted = R.any(R.startsWith(R.__, value), ['secondaryRun', 'cancel'])

  useEffect(() => {
    annotationTypeInit({
      annotationType,
      inputConditions: [
        R.both(RA.isNotNil, RA.isNonEmptyArray),
        R.both(RA.isNotNil, RA.isNonEmptyArray),
        RA.isNotNil
      ],
      inputChecklistLabels: [
        'Sample annotation file (.txt format)',
        'Normal cell type selection',
        'Gene/chromosome position file (.txt format)'
      ],
      submitFunction: submitInferCNV,
      uploadFunctions: [
        // inputIndex: 0 - sample annotation file upload or retrieving previously upload sample annotations
        uploadOptions => new Promise(async (resolve, reject) => {
          try {
            const {newUpload, variables} = uploadOptions

            // Clear the normal cell types from the previous InferCNV secondary run
            await updateNormalCellTypes({variables: {normalCellTypes: []}})
            // Upload the sample annots file
            // (only if the user uploaded a sample annots file vs. choosing to use the previously uploaded sample annots file)
            if (newUpload) await uploadSampleAnnots({...{variables}})
            // Refetch and set the current sample annots
            const {data: {sampleAnnots: sampleAnnotsResults}} = await refetchSampleAnnots()
            
            if (RA.isNotNil(sampleAnnotsResults)) {
              setCurrSampleAnnots(sampleAnnotsResults)

              // Reset the currently selected normal cell types (if one or more had been selected by the user)
              // now that a new sample annotations file has been uploaded
              setNormalCellTypes(normalCellTypes => {
                const isNormalCellTypesSelected = RA.isNonEmptyArray(normalCellTypes)

                if (isNormalCellTypesSelected) {
                  // Reset the normal cell types in MongoDB
                  uploadInput({
                    inputIndex: 1,
                    uploadOptions: {
                      variables: {
                        normalCellTypes: []
                      }
                    }
                  })
                }

                // Update the state accordingly
                return isNormalCellTypesSelected ? [] : normalCellTypes
              })
            }

            resolve({data: RA.isNotNil(sampleAnnotsResults) ? sampleAnnotsResults : null})
          } catch {
            reject()
          }
        }),
        // inputIndex: 1 - normal cell type update
        uploadOptions => new Promise(async (resolve, reject) => {
          try {
            const {variables: {normalCellTypes: value}} = uploadOptions
            const {data: {updateNormalCellTypes: updateNormalCellTypesResults}} = await updateNormalCellTypes(uploadOptions)

            // Update the normal cell type state now that the GraphQL mutation has successfully executed
            setNormalCellTypes(value)
            resolve(updateNormalCellTypesResults ? {data: value} : null)
          } catch {
            reject()
          }
        }),
        // inputIndex: 2 - gene position file upload
        uploadGenePos
      ]
    })
  }, [annotationTypeInit, refetchSampleAnnots, submitInferCNV, updateNormalCellTypes, uploadGenePos, uploadInput, uploadSampleAnnots])

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
      { !secondaryRunSubmitted ? (
        <Grid>
          <Grid.Row>
            <Grid.Column>
              <UploadSampleAnnotsButton {...{prevSampleAnnots: sampleAnnots, currSampleAnnots}} />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <AddNormalCellTypesButton {...{normalCellTypes, sampleAnnots: currSampleAnnots}} />
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