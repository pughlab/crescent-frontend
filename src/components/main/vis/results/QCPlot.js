import React, {useState, useEffect, useCallback } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Loader, Segment, Header, Icon } from 'semantic-ui-react'

import {ClimbingBoxLoader} from 'react-spinners'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const QCPlot = withRedux(
  ({
  app: {
    run: {runID}
  },
  actions: {
    thunks: {
      fetchQC
    }
  }
}) => {
  // use local state for data
  const [qcData, setQCData] = useState( [] )

  useEffect(() => {
    setQCData( [] ) // set to loading
    fetchQC(runID).then((data) => {
      R.ifElse(
        R.has('error'),
        R.always(console.log(data['error'])),
        setQCData
      )(data)
      console.log(data)
    })
    

    //TODO: return clear qc redux state change
  }, [])

  return (
    // Empty qc data => loading
    R.isEmpty(qcData) ?
      <Segment basic placeholder style={{height: '100%'}}>
        <Header textAlign='center' icon>
          <ClimbingBoxLoader color='#6435c9' />
        </Header>
      </Segment>
    :
    // Plot data
      <>
      <Header textAlign='center' content='QC' />
      <Plot
        config={{showTips: false}}
        data={qcData}
        useResizeHandler
        style={{width: '100%', height:'90%'}}
        layout={{
          autosize: true,
          grid: {rows: 1, columns: 4, pattern: 'independent'},
          hovermode: 'closest',
          margin: {l:50, r:50, b:20, t:20},
          showlegend: false
        }}
      />
      </>
  )
})

export default QCPlot 
