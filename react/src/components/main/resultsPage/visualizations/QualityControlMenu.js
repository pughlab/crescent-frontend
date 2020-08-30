import React, {useState, useEffect } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Button, Form, Dropdown, Segment, Popup, Label, Icon, Header, Grid, Divider } from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import * as R_ from 'ramda-extension'

import {useDispatch} from 'react-redux'
import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'
import {useRunDatasetsQuery, useQCAvailableQuery, useQCMetricsQuery} from '../../../../apollo/hooks'
import {setSelectedQC, setSelectedQCDataset} from '../../../../redux/actions/resultsPage'

import {useRunDatasetsDropdownQuery} from '../../../../apollo/hooks/useRunDatasetsQuery'

const QualityControlMenu = ({
  runID
}) => {    
  const dispatch = useDispatch()
  const {selectedQCDataset, selectedQC} = useResultsPage()
  const datasetsOptions = useRunDatasetsDropdownQuery(runID, {
    onNonEmptyOptions: options => {
      const [{value}] = options
      dispatch(setSelectedQCDataset({value}))
    }
  })
  
  const availableQc = useQCAvailableQuery({runID, datasetID: selectedQCDataset})
  const qcMetrics = useQCMetricsQuery({runID, datasetID: selectedQCDataset})

  if (R.any(R.isNil, [datasetsOptions, availableQc])) {
    return null
  }


  return (
    <>
    <Divider horizontal content='QC Plot Type' />
    <Dropdown selection fluid labeled
      options={availableQc}
      value={selectedQC}
      onChange={(e, {value}) => dispatch(setSelectedQC({value}))}
    />
    <Divider horizontal content='Datasets' />
    <Dropdown selection fluid labeled search
      loading={R.isNil(datasetsOptions)}
      options={datasetsOptions || []}
      value={selectedQCDataset}
      onChange={(e, {value}) => dispatch(setSelectedQCDataset({value}))}
    />

    {
      R.ifElse(
        R.isNil,
        R_.alwaysNull,
        ({cellcounts: {Before, After}, qcSteps}) => (
          <>
          <Divider horizontal content='QC Metrics' />
          <Segment basic textAlign='center' style={{padding: '0rem'}}>
          <Label basic color={'blue'} size={'medium'}
            content='Cells Before QC:'
            detail={Before}
          />
          <Label basic color={'orange'} size={'medium'}
            content='Cells After QC:'
            detail={After}
          />
          </Segment>
          {
            R.addIndex(R.map)(
              ({filtertype, numRemoved, min, max}, index) => (
                <Segment compact key={index} style={{padding: '0.77rem'}} >
                  <Label attached='top' content={filtertype}/>
                  <Label basic size={'small'} style={{margin: '0.25rem'}} content={`Filter Min: ${min}`} color='grey' />
                  <Label basic size={'small'} style={{margin: '0.25rem'}} content={`Filter Max: ${max}`} color='grey' />
                  <Label basic size={'small'} style={{margin: '0.25rem'}} content={`Cells Removed: ${numRemoved}`} color={R.ifElse(R.equals(0),R.always('grey'),R.always('red'))(numRemoved)} />
                </Segment>
              ),
              qcSteps
            )
          }
          </>
        )
      )(qcMetrics)
    }
    </>
  )
}

export default QualityControlMenu