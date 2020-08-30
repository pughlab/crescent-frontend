import React, {useState, useEffect } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Button, Form, Dropdown, Segment, Popup, Label, Icon, Header, Grid, Divider } from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useDispatch} from 'react-redux'
import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'
import {useRunDatasetsQuery, useQCAvailableQuery, useQCMetricsQuery} from '../../../../apollo/hooks'
import {setSelectedQC, setSelectedQCDataset} from '../../../../redux/actions/resultsPage'

const QualityControlMenu = ({
  runID
}) => {    
  // const {runID} = useCrescentContext()

  const dispatch = useDispatch()
  const {selectedQCDataset, selectedQC} = useResultsPage()
  // const isActiveResult = R.equals(activeResult)

  // const run = useRunDatasetsQuery(runID)

  const run = useRunDatasetsQuery(runID)

  // if (R.isNil(run)) {
  //   return null
  // }
  
  // const availableQc = useQCAvailableQuery({runID, selectedQCDataset})
  // const qcMetrics = useQCMetricsQuery({runID, selectedQCDataset})

  // if (R.any(R.isNil, [run, availableQc, qcMetrics])) {
  //   return null
  // }
  if (R.any(R.isNil, [run])) {
    return null
  }

  const {datasets} = run
  // const {cellcounts: cellcounts} = qcMetrics
  // const {qcSteps: qcSteps} = qcMetrics

  const datasetIDs = R.pluck('datasetID')(datasets)


  console.log('selected dataset: ',selectedQCDataset)
  console.log('datasetIDs: ', datasetIDs)
  // const [AvailableQCPlots, setAvailableQCPlots] = useState([])
  // var [qcMetrics, setMetrics] = useState([])


  // useEffect(() => {
  //   fetchAvailableQC(runID).then((data) => {
  //     R.ifElse(
  //       R.has('error'),
  //       R.always(console.log(data['error'])),
  //       initializeQC
  //     )(data)
  //   });
  // }, [])

  // useEffect(() => {
  //   fetchMetrics(runID).then((data) => {
  //     R.ifElse(
  //       R.has('error'),
  //       R.always(console.log(data['error'])),
  //       setMetrics
  //     )(data)
  //   })

  //   return setMetrics([])

  // }, [runID])

  // const initializeQC = (availableQc) => {
  //   // set the dropdown values
  //   // setAvailableQCPlots(availableQc)
  //   R.isNil(selectedQC) ? dispatch(setSelectedQC({availableQc})) : dispatch(setSelectedQC({selectedQC}))
  // }
  
  // var qcSteps = R.ifElse(
  //   R.or(R.isNil,R.isEmpty), 
  //   R.always([]), 
  //   R.always(qcMetrics[1])
  // )(qcMetrics)

  // const availableQcArray = R.compose(
  //   R.head,
  //   R.values
  // )(availableQc)

  // console.log(R.values(availableQcArray))

  const formatList = R.addIndex(R.map)((val, index) => ({key: index, text: val, value: val}))

  return (
    <>
    {/* <Divider horizontal content='QC Plot Type' />
    <Dropdown
      selection
      fluid
      labeled
      options={availableQc}
      // options = {dropdown_plots}

      onChange={(e, {value}) => dispatch(setSelectedQC({value}))}

      defaultValue={RA.isNotNilOrEmpty(selectedQC) ? selectedQC : ''}
    /> */}
    <Divider horizontal content='Datasets' />
    <Dropdown
      selection
      fluid
      labeled
      options={formatList(datasetIDs)}
      // options = {dropdown_plots}
      value={selectedQCDataset}
      defaultValue={RA.isNotNil(selectedQCDataset) ? selectedQCDataset : dispatch(setSelectedQCDataset({value: datasetIDs[0]}))}

      onChange={(e, {value}) => dispatch(setSelectedQCDataset({value}))}

      // defaultValue={RA.isNotNilOrEmpty(selectedQC) ? selectedQC : ''}
    />

    {/* <Divider horizontal content='QC Metrics' />
    <Segment basic textAlign='center' style={{padding: '0rem'}}>
    <Label basic color={'blue'} size={'medium'}>
      Cells Before QC:
      <Label.Detail>
        {
          R.ifElse(
            R.or(R.isNil, R.isEmpty),
            R.always(""),
            ({Before}) => {return Before}
          )(cellcounts)

        }
      </Label.Detail>
    </Label>
    <Label basic color={'orange'} size={'medium'} >
      Cells After QC:
      <Label.Detail>
        {
          R.ifElse(
            R.or(R.isNil, R.isEmpty),
            R.always(""),
            ({After}) => {return After}
          )(cellcounts)

        }
      </Label.Detail>
    </Label>
    </Segment>
    {
      R.ifElse(
        R.isNil,
        R.always(<div></div>),
        R.addIndex(R.map)(
          ({filtertype, numRemoved, min, max}, index) => (
            <Segment compact key={index} style={{padding: '0.77rem'}} >
              <Label attached='top' content={filtertype}/>
              <Label
              basic
              size={'small'}
              style={{margin: '0.25rem'}}
              content={`Filter Min: `+min}
              color='grey'
              />
              <Label
              basic
              size={'small'}
              style={{margin: '0.25rem'}}
              content={`Filter Max: `+max}
              color='grey'
              />
              <Label
              basic
              size={'small'}
              style={{margin: '0.25rem'}}
              content={`Cells Removed: `+numRemoved}
              color={R.ifElse(R.equals(0),R.always('grey'),R.always('red'))(numRemoved)}
              />
            </Segment>
        ))
      )(qcSteps)
    } */}
    </>
  )
}

export default QualityControlMenu