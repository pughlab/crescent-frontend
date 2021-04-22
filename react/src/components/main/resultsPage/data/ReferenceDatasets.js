import React, {useState, useCallback, useEffect} from 'react'

import {Button, Icon, Segment, List, Message, Divider } from 'semantic-ui-react'

import {useDropzone} from 'react-dropzone'

import * as RA from 'ramda-adjunct'
import * as R from 'ramda'


import {useUpdateRunReferenceDatasetsMutation} from '../../../../apollo/hooks/run'



export default function ReferenceDatasets({
  runID
}) {
  
  const {run, updateRunReferenceDatasets, loading} = useUpdateRunReferenceDatasetsMutation({runID})

  if (R.any(R.isNil, [run])) {
    return null
  }

  const {status, datasets, referenceDatasets} = run

  const runIsPending = R.equals(status, 'pending')
  const referenceDatasetIDs = R.pluck('datasetID', referenceDatasets)
  const isReferenceDataset = R.includes(R.__, referenceDatasetIDs)
  const addReferenceDataset = datasetID => updateRunReferenceDatasets({variables: {datasetIDs: R.uniq([... referenceDatasetIDs, datasetID])}})
  const removeReferenceDataset = datasetID => updateRunReferenceDatasets({variables: {datasetIDs: R.without([datasetID], referenceDatasetIDs)}})

  const disableAddingReferences = R.lt(2, R.length(referenceDatasetIDs))

  return (
    <>
      <Message color='blue'>
        Select which run datasets to use as reference/anchors (up to 3)
      </Message>
      <Segment color='blue' loading={loading}>
        <Divider horizontal content={`${R.length(referenceDatasetIDs)}/3 datasets selected`} />
        <List divided relaxed selection celled>
          {
            R.compose(
              R.map(({datasetID, name}) => {
                const isReference = isReferenceDataset(datasetID)
                return (
                  <List.Item key={datasetID} active={isReference}>
                    <List.Content floated='left'>
                      <List.Header content={name} />
                    </List.Content>
                    {
                      <List.Content floated='right'>
                        {
                          runIsPending ? 
                            <Button floated='right'
                              disabled={!isReference && disableAddingReferences}
                              color='blue'
                              onClick={() => {
                                if (isReference) {
                                  removeReferenceDataset(datasetID)
                                } else if (!disableAddingReferences) {
                                  addReferenceDataset(datasetID)
                                }
                              }}
                              content={isReference ? 'Unanchor' : 'Anchor'}
                            />
                            :
                            <Button floated='right' disabled={true} color='blue' basic={R.not(isReference)}
                              content={isReference ? 'Anchored' : 'Unanchored'}
                            />
                        }
                      </List.Content>
                    }
                  </List.Item>
                )
              })
            )(datasets)
          }
        </List>
      </Segment>
    </>
  )
}