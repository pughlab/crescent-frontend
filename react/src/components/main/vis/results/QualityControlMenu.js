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
    }
  }
}) => {

  const [AvailableQCPlots, setAvailableQCPlots] = useState([])

  useEffect(() => {
    fetchAvailableQC(runID).then((data) => {
      R.ifElse(
        R.has('error'),
        R.always(console.log(data['error'])),
        initializeQC
      )(data)
    });
  }, [])

  const initializeQC = (data) => {
    // set the dropdown values
    setAvailableQCPlots(data)
    R.isNil(selectedQC) ? setSelectedQC(data[0]['value']) : setSelectedQC(selectedQC)
  }

  return (
    <>
    <Divider horizontal content='QC Plot Type' />
    <Dropdown
      selection
      fluid
      labeled
      options={AvailableQCPlots}
      onChange={(e, {value}) => setSelectedQC(value)}
      //defaultValue={'Before_After_Filtering'}
      // why doesn't this work?
      defaultValue={RA.isNotNilOrEmpty(selectedQC) ? selectedQC : ''}
    />
    </>
  )
})

export default QualityControlMenu