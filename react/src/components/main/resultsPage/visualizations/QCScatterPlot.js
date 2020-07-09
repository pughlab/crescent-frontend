import React, {useState, useEffect, useCallback } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Image, Segment, Header, Icon } from 'semantic-ui-react'

import Tada from 'react-reveal/Tada'
import Logo from '../../../login/logo.jpg'
import {ClimbingBoxLoader} from 'react-spinners'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useDispatch} from 'react-redux'
import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'
import {useQCScatterQuery} from '../../../../apollo/hooks'

const QCScatterPlot = ({
}) => { 

  const {runID} = useCrescentContext()
  const dispatch = useDispatch()
  const {selectedQC} = useResultsPage()
  console.log(selectedQC)

  // const qcType = "Number_of_Genes"
  // const qcViolin = useQCViolinQuery(runID)
  const qcScatter = useQCScatterQuery(selectedQC, runID)
  // console.log(qcScatter)

  // const qcScatterData = R.compose(
  //   R.values,
  //   R.map
  // )(qcScatter)

  // console.log(qcScatter)

  if (R.any(R.isNil, [qcScatter])) {
    return (
      <Segment style={{height: '100%'}} basic>
      <Tada forever duration={1000}>
        <Image src={Logo} centered size='medium' />
      </Tada>
    </Segment>
    )
  }

  const qcScatterData = []
  qcScatterData.push(qcScatter)

  // const qcViolinData = R.compose(
  //   R.head,
  //   R.values
  // )(qcViolin)

  console.log(qcScatterData)
  // console.log(qcViolinData)

  // const qcScatterData = R.compose(
  //   R.head,
  //   R.values
  // )(qcScatter)

  // console.log(R.values(qcScatter))
  // console.log()

  // const qcData = qcViolinData

  // // use local state for data
  // const [qcData, setQCData] = useState( [] )

  // // use the selected plot type to determine this
  // useEffect(() => {
  //   setQCData( [] ) // set to loading
  //   fetchQC(selectedQC).then((data) => {
  //     R.ifElse(
  //       R.has('error'),
  //       R.always(console.log(data['error'])),
  //       setQCData
  //     )(data)
  //   })
  //   //TODO: return clear qc redux state change
  //   return setQCData([])
  
  // }, [selectedQC])

  
  return (
    <>
      <Header textAlign='center' content={R.isNil(selectedQC) ? '' : (selectedQC.replace(/_/g," ")+" (UMAP)")} />
      <Plot
        config={{showTips: false}}
        data={qcScatterData}
        useResizeHandler
        style={{width: '100%', height:'95%'}}
        layout={{
          autosize: true,
          hovermode: 'closest',
          xaxis: {showgrid: false, ticks: '', showticklabels: false},
          yaxis: {showgrid: false, ticks: '', showticklabels: false, scaleanchor: "x"},
          margin: {l:20, r:20, b:20, t:20},
          legend: {"orientation": "v"}
        }}
      />
    </>
  )
}

export default QCScatterPlot 
