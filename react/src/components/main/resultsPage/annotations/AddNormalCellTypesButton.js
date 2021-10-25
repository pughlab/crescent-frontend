import React, {useState, useCallback, useEffect} from 'react'

import {Button, Icon, Segment, Header, Message, Image, Grid, Form } from 'semantic-ui-react'

import {useDropzone} from 'react-dropzone'

import * as RA from 'ramda-adjunct'
import * as R from 'ramda'

import Tada from 'react-reveal/Tada'
import Fade from 'react-reveal/Fade'
import Logo from '../../../login/logo.jpg'

// import AnnotationsSecondaryRuns from './AnnotationsSecondaryRuns'
import {useUploadGenePosMutation} from '../../../../apollo/hooks/run'
import {useCrescentContext} from '../../../../redux/hooks'
import {useRunDetailsQuery, useSubmitGSVAMutation, useSubmitInferCNVMutation, useSampleAnnotsQuery, useUpdateNormalCellTypesMutation} from '../../../../apollo/hooks/run'

import AnnotationsSecondaryRuns from './AnnotationsSecondaryRuns'

export default function AddNormalCellTypesButton({
  runID
}) {
  const {userID: currentUserID} = useCrescentContext()
  const run = useRunDetailsQuery(runID)
  const {updateNormalCellTypes, loading} = useUpdateNormalCellTypesMutation(runID)


  const sampleAnnots = useSampleAnnotsQuery(runID)

  if (R.any(R.isNil, [run])) {
    return (
      null
      // <Segment basic style={{ height: '100%' }} placeholder>
      //   <Tada forever duration={1000}>
      //     <Image src={Logo} centered size='medium' />
      //   </Tada>
      // </Segment>
    )
  }

  if (R.any(R.isNil, [sampleAnnots])) {
    return (
      <Message color='purple'>
        Upload a sample annotations above to select normal cell types.
      <Segment color='purple'>
        <Form>
        <Form.Dropdown 
          selection 
          search
          multiple
          placeholder={'Select one or more normal cell types from sample annotations'}
          // defaultValue={defaultValue}
          disabled={true}
          // label={label}
          // value={parameterValue}
        />
        {/* {
          R.not(disableInput) && 
          <ResetToDefaultValueButton {...{disabled}}
            // onClick={() => updateRunParameterValue({variables: {value: valueTransform(defaultValue)}})}
          />
        } */}
      </Form>
      </Segment>
      </Message>
    )
  }
  // const {status: runStatus, name: runName, createdBy: {userID: creatorUserID}} = run
  // const disabledUpload = R.not(R.equals(currentUserID, creatorUserID))
  
  const formatList = R.addIndex(R.map)((val, index) => ({key: index, text: val, value: val}))
  const {normalCellTypes} = run


  return (
    <>
      <Message color='purple'>
        Select one or more normal cell types from sample annotations.
        <Form>
        <Form.Dropdown 
          selection 
          search
          multiple
          placeholder={'Select one or more normal cell types from sample annotations'}
          // defaultValue={defaultValue}
          // disabled={disableInput}
          options={formatList(sampleAnnots)}
          // label={label}
          // value={normalCellTypes}
          onChange={(e, {value}) => updateNormalCellTypes({variables: {normalCellTypes: value}})}
        />
        {/* {
          R.not(disableInput) && 
          <ResetToDefaultValueButton {...{disabled}}
            // onClick={() => updateRunParameterValue({variables: {value: valueTransform(defaultValue)}})}
          />
        } */}
      </Form>
      </Message>


    </>
  )
}