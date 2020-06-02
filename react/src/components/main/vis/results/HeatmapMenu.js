import React, {useState, useEffect } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Button, Form, Dropdown, Segment, Popup, Label, Icon, Header, Grid, Divider } from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const HeatmapMenu = withRedux(
  ({
  app: {
    run: { runID },
  },
  actions: {
    thunks: {
      fetchGSVAMetrics 
    }
  }
}) => {

  var [gsvaMetrics, setMetrics] = useState([])


  useEffect(() => {
    fetchGSVAMetrics(runID).then((data) => {
      R.ifElse(
        R.has('error'),
        R.always(console.log(data['error'])),
        setMetrics
      )(data)
    })

    return setMetrics([])

  }, [runID])


  console.log(gsvaMetrics)
  return (
    <>
    <Divider horizontal content='Top Predicted Cluster Labels' />
    <Segment basic style={{padding: '0rem'}} style={{maxHeight: '60vh', overflowY: 'scroll'}}>
    {
        R.ifElse(
          R.isNil,
          R.always(<div></div>),
          R.addIndex(R.map)(
            ({cluster, value, score}, index) => (
              <Segment compact key={index}>
                <Label attached='top' content={`Cluster `+cluster}/>
                <Button
                basic
                size={'tiny'}
                style={{margin: '0.25rem'}}
                content={`Predicted Label: `+value}
                />
                <Button
                  basic
                  size={'tiny'}
                  style={{margin: '0.25rem'}}
                  content={`Enrichment Score: `+score}
                />
              </Segment>
            ))
          )(gsvaMetrics)
    }
    </Segment>
    </>
  )
})

export default HeatmapMenu