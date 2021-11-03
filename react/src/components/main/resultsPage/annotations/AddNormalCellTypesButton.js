import React from 'react'

import {Form, Message, Segment} from 'semantic-ui-react'

import * as R from 'ramda'

// import AnnotationsSecondaryRuns from './AnnotationsSecondaryRuns'
import {useCrescentContext} from '../../../../redux/hooks'
import {useRunDetailsQuery, useSampleAnnotsQuery, useUpdateNormalCellTypesMutation} from '../../../../apollo/hooks/run'

export default function AddNormalCellTypesButton({
  runID
}) {
  const {userID: currentUserID} = useCrescentContext()
  const {run} = useRunDetailsQuery(runID)
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