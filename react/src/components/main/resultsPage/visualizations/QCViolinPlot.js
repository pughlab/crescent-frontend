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
import {useQCViolinQuery} from '../../../../apollo/hooks'

const QCViolinPlot = ({
}) => { 

  const {runID} = useCrescentContext()
  const dispatch = useDispatch()
  const {selectedQC} = useResultsPage()
  console.log(selectedQC)

  // const qcType = "Number_of_Genes"
  const qcViolin = useQCViolinQuery(runID)
  // const qcScatter = useQCScatterQuery(selectedQC, runID)
  // console.log(qcScatter)

  // const qcScatterData = R.compose(
  //   R.values,
  //   R.map
  // )(qcScatter)

  // console.log(qcScatter)



  if (R.any(R.isNil, [qcViolin])) {
    return (
    <Segment basic style={{height: '100%'}} placeholder>
      <Tada forever duration={1000}>
        <Image src={Logo} centered size='medium' />
      </Tada>
    </Segment>
    )
  }

  // const qcScatterData = []
  // qcScatterData.push(qcScatter)

  const qcViolinData = R.compose(
    R.head,
    R.values
  )(qcViolin)

  // console.log(qcScatterData)
  console.log(qcViolinData)

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
    // // Empty qc data => loading
    // R.isEmpty(qcViolinData) ?
    //   <Segment basic placeholder style={{height: '100%'}}>
    //     <Header textAlign='center' icon>
    //       <ClimbingBoxLoader color='#6435c9' />
    //     </Header>
    //   </Segment>
    // :
    <>
    <Header textAlign='center' content={R.isNil(selectedQC) ? '' : "Metrics Before and After QC (Violins)"} />
    <Plot
      config={{showTips: false}}
      data={qcViolinData}
      useResizeHandler
      style={{width: '100%', height:'90%'}}
      layout={{
        autosize: true,
        grid: {rows: 1, columns: 4, pattern: 'independent'},
        margin: {l:40, r:40, b:20, t:30},
        showlegend: false,
        hovermode: 'closest',
        yaxis: {
          range: [0, R.isNil(qcViolinData[0]) ? 1.1 : Math.max(...R.map(parseInt, qcViolinData[0]['y']))+1]
        },
        yaxis2: {
          range: [0, R.isNil(qcViolinData[2]) ? 1.1: Math.round(Math.max(...R.map(parseInt, qcViolinData[2]['y'])))+1]
        },
        yaxis3: {
          range: [0, R.isNil(qcViolinData[4]) ? 101: Math.round(Math.max(...R.map(parseInt, qcViolinData[4]['y'])))+1]
        },
        yaxis4: {
          range: [0, R.isNil(qcViolinData[6]) ? 101: Math.round(Math.max(...R.map(parseInt, qcViolinData[6]['y'])))+1]
        },
        annotations: [
          {
            "x": 0.11,
            "y": 1,
            "text": "Number of Genes",
            "xref": "paper",
            "yref": "paper",
            "xanchor": "center",
            "yanchor": "bottom",
            "showarrow": false
          },
          {
            "x": 0.37,
            "y": 1,
            "text": "Number of Reads",
            "xref": "paper",
            "yref": "paper",
            "xanchor": "center",
            "yanchor": "bottom",
            "showarrow": false
          },
          {
            "x": 0.63,
            "y": 1,
            "text": "Percentage of Mitochondrial Genes",
            "xref": "paper",
            "yref": "paper",
            "xanchor": "center",
            "yanchor": "bottom",
            "showarrow": false
          },
          {
            "x": 0.89,
            "y": 1,
            "text": "Percentage of Ribosomal Protein Genes",
            "xref": "paper",
            "yref": "paper",
            "xanchor": "center",
            "yanchor": "bottom",
            "showarrow": false
          }
          ]
      }}
    />
    </>
  )
}

export default QCViolinPlot 
