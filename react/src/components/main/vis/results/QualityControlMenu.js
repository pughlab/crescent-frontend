import React, {useState, useEffect } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Button, Form, Dropdown, Segment, Popup, Label, Icon, Header, Grid, Divider } from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const QualityControlMenu = withRedux(
  ({
  app: {
    run: { runID },
    toggle: {vis: {results: {selectedQC}}}
  },
  actions: {
    toggle: {
      setSelectedQC
    },
    thunks: {
      fetchAvailableQC,
      fetchMetrics
    }
  }
}) => {

  const [AvailableQCPlots, setAvailableQCPlots] = useState([])
  var [qcMetrics, setMetrics] = useState([])


  useEffect(() => {
    fetchAvailableQC(runID).then((data) => {
      R.ifElse(
        R.has('error'),
        R.always(console.log(data['error'])),
        initializeQC
      )(data)
    });
  }, [])

  useEffect(() => {
    fetchMetrics(runID).then((data) => {
      R.ifElse(
        R.has('error'),
        R.always(console.log(data['error'])),
        setMetrics
      )(data)
    })

    return setMetrics([])

  }, [runID])

  const initializeQC = (data) => {
    // set the dropdown values
    setAvailableQCPlots(data)
    R.isNil(selectedQC) ? setSelectedQC(data[0]['value']) : setSelectedQC(selectedQC)
  }
  
  var qcSteps = R.ifElse(
    R.or(R.isNil,R.isEmpty), 
    R.always([]), 
    R.always(qcMetrics[1])
  )(qcMetrics)

  return (
    <>
    <Divider horizontal content='QC Plot Type' />
    <Dropdown
      selection
      fluid
      labeled
      options={AvailableQCPlots}
      onChange={(e, {value}) => setSelectedQC(value)}
      defaultValue={RA.isNotNilOrEmpty(selectedQC) ? selectedQC : ''}
    />

    <Divider horizontal content='QC Metrics' />

    <Segment basic textAlign='center' style={{padding: '0rem'}}>
    <Label basic color={'blue'} size={'large'}>
      Cells Before QC:
      <Label.Detail>
        {
          R.ifElse(
            R.or(R.isNil, R.isEmpty),
            R.always(""),
            ({Before}) => {return Before}
          )(R.prop("cellcounts", qcMetrics[0]))
        }
      </Label.Detail>
    </Label>
    </Segment>

    {
      R.ifElse(
        R.isNil,
        R.always(<div></div>),
        R.addIndex(R.map)(
          ({filtertype, num_removed, min, max}, index) => (
            <Segment compact key={index}>
              <Label attached='top' content={filtertype}/>
              <Button
              basic
              size={'tiny'}
              style={{margin: '0.25rem'}}
              content={`Min: `+min}
              />
              <Button
              basic
              size={'tiny'}
              style={{margin: '0.25rem'}}
              content={`Max: `+max}
              />
              <Button
              basic
              size={'tiny'}
              style={{margin: '0.25rem'}}
              content={`Cells Removed: `+num_removed}
              color={R.ifElse(R.equals("0"),R.always(undefined),R.always('red'))(num_removed)}
              />
            </Segment>
        ))
      )(R.prop('qc_steps',qcSteps))
    }
    <Segment basic textAlign='center' style={{padding: '0rem'}}>
    <Label basic color={'orange'} size={'large'}>
      Cells After QC:
      <Label.Detail>
        {
          R.ifElse(
            R.or(R.isNil, R.isEmpty),
            R.always(""),
            ({After}) => {return After}
          )(R.prop("cellcounts", qcMetrics[0]))
        }
      </Label.Detail>
    </Label>
    </Segment>
    </>
  )
})

export default QualityControlMenu