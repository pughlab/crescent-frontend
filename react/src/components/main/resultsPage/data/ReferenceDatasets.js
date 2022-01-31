import React from 'react'

import {Button, Divider, List, Message, Segment, Label} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useUpdateRunReferenceDatasetsMutation} from '../../../../apollo/hooks/run'
import {useResultsPage} from '../../../../redux/hooks'

export default function ReferenceDatasets({
  runID
}) {
  const {runStatus} = useResultsPage()
  const {run, updateRunReferenceDatasets, loading} = useUpdateRunReferenceDatasetsMutation({runID})

  if (R.any(R.isNil, [run])) {
    return null
  }

  const {parameters: {quality}, datasets, referenceDatasets, datasetIDs} = run

  const runIsPending = R.equals(runStatus, 'pending')
  const referenceDatasetIDs = R.pluck('datasetID', referenceDatasets)
  const isReferenceDataset = R.includes(R.__, referenceDatasetIDs)
  const addReferenceDataset = datasetID => updateRunReferenceDatasets({variables: {datasetIDs: R.uniq([... referenceDatasetIDs, datasetID])}})
  const removeReferenceDataset = datasetID => updateRunReferenceDatasets({variables: {datasetIDs: R.without([datasetID], referenceDatasetIDs)}})

  const disableAddingReferences = R.lt(5, R.length(referenceDatasetIDs))

  //Summing downsampled values with numCells
  const datasetNumCells = R.reduce((numCellsByDatasetID, {datasetID, numCells}) => R.assoc(datasetID, numCells, numCellsByDatasetID), {}, datasets)
  //Plucking downsampled cells
  const downsampledCells = R.compose(
    R.mapObjIndexed((downsample, datasetID, obj) => downsample <= 0 ? datasetNumCells[datasetID] : downsample),
    R.pluck('downsample')
  )(quality)
  
  const downsampledCellsSum = R.sum(R.values(downsampledCells))

  return (
    <>
      <Message color='blue'>
        Select which run datasets to use as reference/anchors (up to 6)
      </Message>
      <Segment color='blue' loading={loading}>
        <Divider horizontal content={`${R.length(referenceDatasetIDs)}/6 datasets selected`} />
        <List divided relaxed selection celled>
          {
            R.compose(
              R.map(({datasetID, name, cancerTag, numCells}) => {
                const isReference = isReferenceDataset(datasetID)
                const downsampledCellsEquivalent = R.equals(R.subtract(numCells,R.prop(datasetID,downsampledCells)), 0)
                const downsampledCellsSubtraction = R.subtract(numCells,R.prop(datasetID,downsampledCells)) 
                return (
                  <List.Item key={datasetID} active={isReference}>
                    <List.Content floated='left'>
                      <Label key={datasetID}
                        size='large'
                        color={R.prop(cancerTag, {
                          'cancer': 'pink',
                          'non-cancer': 'purple',
                          'immune': 'blue',
                        })}
                      >
                        {name}
                        {<Label.Detail content={R.toUpper(cancerTag)} />}
                        {<Label.Detail content={`${numCells} cells`}/>}
                      </Label>
                        {/* Checking number of cells after downsampling (if downsample occurred) */}
                      {downsampledCellsSubtraction == 0 ? null :
                      <Label>
                      {<Label.Detail content={`${downsampledCellsEquivalent ? null : downsampledCellsSubtraction } cells after downsample`}/>}
                      </Label>
              }
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
                              size='large'
                            />
                        }
                      </List.Content>
                    }
                  </List.Item>
                )
              }),
              R.reverse,
              R.sortBy(R.prop('numCells'))
            )(datasets)
          }
        </List>
      </Segment>
    </>
  )
}