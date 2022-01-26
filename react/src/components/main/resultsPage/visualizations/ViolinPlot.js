import React, {useState, useEffect, useCallback } from 'react'
import ResponsivePlot, {ResponsivePlotSegment} from './ResponsivePlot'
import { Image, Segment, Header, Icon } from 'semantic-ui-react'

import Tada from 'react-reveal/Tada'
import Logo from '../../../login/logo.jpg'
import {ClimbingBoxLoader} from 'react-spinners'
import Shake from 'react-reveal/Shake'
import PlotHeader from './PlotHeader'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { useService } from '@xstate/react';
import {useDispatch} from 'react-redux'
import {useCrescentContext} from '../../../../redux/hooks'
import {useResultsPagePlotQuery} from '../../../../redux/hooks/useResultsPage'
import {useViolinQuery} from '../../../../apollo/hooks/results'

const ViolinPlot = ({
  plotQueryIndex
}) => {
  const {runID} = useCrescentContext()
  const dispatch = useDispatch()
  const {selectedFeature, selectedGroup, selectedDiffExpression, selectedAssay, runID: compareRunID, plotQueryID, service} = useResultsPagePlotQuery(plotQueryIndex)
  useViolinQuery(selectedFeature, selectedGroup, runID || compareRunID, selectedDiffExpression, selectedAssay, plotQueryIndex)

  const [current, send] = useService(service)

  // use local state for data since too big for redux store
  // const [violinData, setViolinData] = useState( [] )

  // useEffect(() => {
  //   getCategoricalGroups(runID)
  //   return () => resetGroups(runID);
  // },[])

  // Only refetch data if both group and feature are selected for violin
  // useEffect(() => {
  //   if(R.all(RA.isNotNil, [selectedGroup, selectedFeature])){
  //     setViolinData( [] ) // set to loading
  //     fetchViolin().then(setViolinData)
  //   }
  // }, [selectedGroup, selectedFeature])

  if (current.matches('idle')) {
    return (
      <Segment basic style={{height: '100%'}} placeholder>
        <Shake forever duration={10000}>
        <Header textAlign='center' icon>
          <Icon name='right arrow' />
          Select a gene to initialize violin plot
        </Header>  
        </Shake>      
      </Segment>
    )
  }
  if (current.matches('initialLoading')) {
    return (
      <Segment basic style={{height: '100%'}} placeholder>
        <Tada forever duration={1000}>
          <Image style={{ display: 'block' }} src={Logo} centered size='medium' />
        </Tada>
      </Segment>
    )
  }

  // const violinData = R.compose(
  //   R.head,
  //   R.values
  // )(violin)

  // console.log(violinData)

  return (
    // Violin plot must have selected feature
    // R.isNil(selectedFeature) ?
    //   // <Segment basic placeholder style={{height: '100%'}}>
    //   //   <Header icon>
    //   //     <Icon name='right arrow' />
    //   //     Select a gene to initialize violin plot
    //   //   </Header>
    //   // </Segment>
    //   <Segment style={{height: '100%'}} placeholder>
    //     <Shake forever duration={10000}>
    //     <Header textAlign='center' icon>
    //       <Icon name='right arrow' />
    //       Select a gene to initialize violin plot
    //     </Header>  
    //     </Shake>      
    //   </Segment>
    // // Empty violin data => loading
    // : R.isEmpty(violinData) ?
    //   <Segment basic placeholder style={{height: '100%'}}>
    //     <Header textAlign='center' icon>
    //       <ClimbingBoxLoader color='#6435c9' />
    //     </Header>
    //   </Segment>
    // :
    // Plot data
    <>
      <PlotHeader {...{plotQueryID}} name="Gene Expression Violin" runID={runID || compareRunID} />
      <ResponsivePlotSegment loading={current.matches('dataLoading')}>
        <ResponsivePlot
          automargin
          config={{showTips: false}}
          data={current.context.plotData}
          layout={{
            hovermode: 'closest',
            xaxis: {tickmode: 'linear', autorange: true, type: 'category'},
            yaxis: {showgrid: false, title: {text: 'Gene Expression'}},
            margin: {l:45, r:20, b:20, t:20},
          }}
        />
      </ResponsivePlotSegment>
    </>
  )
}

export default ViolinPlot 
