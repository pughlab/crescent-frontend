import React, {useEffect, useState} from 'react'
import {Image, Grid, Segment} from 'semantic-ui-react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import Tada from 'react-reveal/Tada'
import Logo from '../../../login/logo.jpg'

import {useDispatch} from 'react-redux'
import {useAnnotations} from '../../../../redux/hooks'
import {setGenePosUploaded, setSampleAnnotsUploaded} from '../../../../redux/actions/annotations'

import {useSubmitInferCNVMutation, useSampleAnnotsQuery, useUpdateNormalCellTypesMutation} from '../../../../apollo/hooks/run'

import UploadSampleAnnotsButton from './UploadSampleAnnotsButton'
import UploadGenePosButton from './UploadGenePosButton'
import AddNormalCellTypesButton from './AddNormalCellTypesButton'

import SecondaryRunLogs from '../logs/SecondaryRunLogs'
import AnnotationsSecondaryRuns, {NoSecondaryRuns} from './AnnotationsSecondaryRuns'

export default function InferCNV({ runID }) {
  const dispatch = useDispatch()
  const {secondaryRunWesID} = useAnnotations()
  // const {userID: currentUserID} = useCrescentContext()
  const {refetchSampleAnnots, sampleAnnots} = useSampleAnnotsQuery(runID)
  const {submitInferCNV, run, loading: loadingInferCNV, secondaryRunSubmitted} = useSubmitInferCNVMutation(runID)
  const [secondaryRuns, setSecondaryRuns] = useState(null)
  const [currSampleAnnots, setCurrSampleAnnots] = useState(null)
  const [normalCellTypes, setNormalCellTypes] = useState([])

	const annotationType = 'InferCNV'

  useEffect(() => {
    dispatch(setSampleAnnotsUploaded({uploaded: null}))
    dispatch(setGenePosUploaded({uploaded: null}))
  }, [dispatch])

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
              <UploadSampleAnnotsButton {...{refetchSampleAnnots, runID, sampleAnnots, secondaryRunSubmitted, setCurrSampleAnnots}} />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <AddNormalCellTypesButton {...{runID, sampleAnnots: currSampleAnnots, secondaryRunSubmitted, setNormalCellTypes}} />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <UploadGenePosButton {...{loadingInferCNV, normalCellTypes, runID, sampleAnnots: currSampleAnnots, secondaryRunSubmitted, setNormalCellTypes, submitInferCNV}} />
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