import React, {useState, useCallback, useEffect} from 'react'

import {Button, Icon, Segment, Header, Grid, Divider, Label, Input, Image } from 'semantic-ui-react'

import {useDropzone} from 'react-dropzone'

import * as RA from 'ramda-adjunct'
import * as R from 'ramda'

import Tada from 'react-reveal/Tada'
import Fade from 'react-reveal/Fade'
import Logo from '../../../login/logo.jpg'

import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {queryIsNotNil} from '../../../../utils'

import {useUploadDatasetMetadataMutation} from '../../../../apollo/hooks/dataset'
import {useDatasetDetailsQuery, useAddCustomTagDatasetMutation, useRemoveCustomTagDatasetMutation} from '../../../../apollo/hooks/dataset'

export default function AddCustomTagsButton({
  datasetID
}) {
  // const dataset = useDatasetDetailsQuery(datasetID)
  // const {addCustomTagDataset, dataset} = useAddCustomTagDatasetMutation(datasetID)
  // const {removeCustomTagDataset, dataset} = useRemoveCustomTagDatasetMutation(datasetID)

  const [customTagAdded, setCustomTagAdded] = useState('')
  const [customTagAddedError, setCustomTagAddedError] = useState(false)

  // Dataset details
  const {loading, data: dataDatasetDetails, error, refetch: refetchDatasetDetails} = useQuery(gql`
  query DatasetDetails (
    $datasetID: ID!
  ) {
    dataset(
      datasetID: $datasetID
    ) {
      datasetID
      name
      hasMetadata
      size
      cancerTag
      oncotreeCode
      customTags
    }
  }
`, {
  fetchPolicy: 'network-only',
  variables: {datasetID}
  })

  const customTags = R.ifElse(
    queryIsNotNil('dataset'),
    R.path(['dataset', 'customTags']),
    R.always([])
  )(dataDatasetDetails)

  // if (R.any(R.isNil, [dataset])) {
  //   return null
  // }

  const [removeCustomTagDataset] = useMutation(gql`
  mutation RemoveCustomTagDataset(
    $datasetID: ID!
    $customTag: String
  ) {
    removeCustomTagDataset(
      datasetID: $datasetID
      customTag: $customTag
    ) {
      datasetID
      customTags
    }
  }
`, {
  variables: {datasetID},
  onCompleted: ({removeCustomTagDataset}) => {
    setCustomTagAdded('')
    refetchDatasetDetails()
  }
  })

  const [addCustomTagDataset] = useMutation(gql`
  mutation AddCustomTagDataset(
    $datasetID: ID!
    $customTag: String
  ) {
    addCustomTagDataset(
      datasetID: $datasetID
      customTag: $customTag
    ) {
      datasetID
      customTags
    }
  }
`, {
  variables: {
    datasetID
  },
  onCompleted: ({addCustomTagDataset}) => {
    if (R.isNil(addCustomTagDataset)) {
      setCustomTagAddedError(true)
    }
    setCustomTagAdded('')
    refetchDatasetDetails()
    }
  })

  // const {customTags} = dataset
  // console.log(customTags)

  return (
    <Grid>
    {
      RA.isNotEmpty(customTags) &&
      <Grid.Column width={16}>
        {/* <Divider content='Custom Tags' horizontal /> */}
        <Label.Group size='large'>
        {
          R.addIndex(R.map)(
            (value, index) => (
              <Label key={index}
                basic
                color='grey'
                content={R.toUpper(value)}
                onRemove={
                  () => removeCustomTagDataset({
                    variables: {customTag: value}
                  })
                }
              />
            ),
            customTags
          )
        }
        </Label.Group>
      </Grid.Column>
    }
    <Grid.Column width={12}>
      <Input 
        placeholder='Enter custom tag'
        icon='paperclip'
        fluid
        value={customTagAdded}
        onChange={(e, {value}) => {
          setCustomTagAddedError(false)
          setCustomTagAdded(value)
        }}
        error={customTagAddedError}
      />
    </Grid.Column>
    <Grid.Column width={4}>
      <Button fluid content='Add'
        onClick={() => addCustomTagDataset({variables: {customTag: customTagAdded}}) && setCustomTagAdded('')}
      />
    </Grid.Column>
    </Grid>

  )
}