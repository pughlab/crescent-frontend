import React from 'react'
import {Form, Icon, Message, Segment} from 'semantic-ui-react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import {useUpdateNormalCellTypesMutation} from '../../../../apollo/hooks/run'

const NormalCellTypeSelection = ({ children, icon, ...props }) => (
  <Message color="purple">
    <Icon name={icon} />
    { children }
    <Segment color="purple">
      <Form>
        <Form.Dropdown
          selection
          search
          multiple
          {...props}
        />
      </Form>
    </Segment>
  </Message>
)

export default function AddNormalCellTypesButton({
  runID,
  sampleAnnots,
  secondaryRunSubmitted,
  setNormalCellTypes
}) {
  // const {userID: currentUserID} = useCrescentContext()
  const {updateNormalCellTypes} = useUpdateNormalCellTypesMutation(runID)

  if (R.isNil(sampleAnnots)) {
    return (
      <NormalCellTypeSelection
        disabled
        icon="upload"
        placeholder="Select one or more normal cell types from sample annotations"
      >
        Upload a sample annotations above to select normal cell types.
      </NormalCellTypeSelection>
    )
  }

  if (RA.isEmptyArray(sampleAnnots)) {
    return (
      <NormalCellTypeSelection
        disabled
        icon="exclamation circle"
        placeholder="No normal cell types found from sample annotations"
      >
        Upload a sample annotations with one or more normal cell types to make a selection.
      </NormalCellTypeSelection>
    )
  }

  // const {status: runStatus, name: runName, createdBy: {userID: creatorUserID}} = run
  // const disabledUpload = R.not(R.equals(currentUserID, creatorUserID))
  
  const formatList = R.addIndex(R.map)((val, index) => ({key: index, text: val, value: val}))

  return (
    <NormalCellTypeSelection
      disabled={secondaryRunSubmitted}
      icon="arrow circle down"
      onChange={async (e, {value}) => {
        const {data: {updateNormalCellTypes: updateNormalCellTypesResults}} = await updateNormalCellTypes({variables: {normalCellTypes: value}})

        if (RA.isNotNil(updateNormalCellTypesResults)) setNormalCellTypes(value)
      }}
      options={formatList(sampleAnnots)}
      placeholder="Select one or more normal cell types from sample annotations"
    >
      Select one or more normal cell types from sample annotations.
    </NormalCellTypeSelection>
  )
}