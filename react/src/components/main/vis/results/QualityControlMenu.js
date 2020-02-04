import React, {useState, useEffect } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Button, Form, Dropdown, Segment, Popup, Label, Icon, Header, Grid } from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const QualityControlMenu = withRedux(
  ({
  app: {
    run: { runID },
  },
  actions: {
    thunks: {
      fetchAvailableQC
    }
  }
}) => {

  const [AvailableQCPlots, setAvailableQCPlots] = useState([])

  useEffect(() => {
    fetchAvailableQC(runID).then((data) => {
      R.ifElse(
        R.has('error'),
        R.always(console.log(data['error'])),
        setAvailableQCPlots
      )(data)
    });
  }, [])

  const checkResponse = (resp) => {
    if(!resp.ok){throw Error(resp.statusText);}
    return resp
  }

  return (
    <Dropdown
      selection
      fluid
      options={AvailableQCPlots}
      //options={[{key: 'Violin', text: 'Violin', value: 'violin'}, {key: 'Number of Genes', text: 'Num Genes',value: 'Number_of_genes'}]}
    />
  )
})

export default QualityControlMenu