import React, {useState, useEffect, useCallback } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Image, Segment, Header, Icon } from 'semantic-ui-react'

import Tada from 'react-reveal/Tada'
import Logo from '../../../login/logo.jpg'
import {ClimbingBoxLoader} from 'react-spinners'
import Shake from 'react-reveal/Shake'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useDispatch} from 'react-redux'
import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'
import {useViolinQuery} from '../../../../apollo/hooks'
import {setSelectedQC} from '../../../../redux/actions/resultsPage'

const ViolinPlot = ({
}) => {
  const {runID} = useCrescentContext()
  const dispatch = useDispatch()
  const {selectedFeature, selectedGroup, selectedDiffExpression} = useResultsPage()
  const violin = useViolinQuery(selectedFeature, selectedGroup, runID, selectedDiffExpression)
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

  if (R.any(R.isNil, [selectedFeature])) {
    return (
      <Segment basic style={{height: '100%'}} placeholder>
        <Shake forever duration={10000}>
        <Header textAlign='center' icon>
          <Icon name='right arrow' />
          Select a feature to initialize violin plot
        </Header>  
        </Shake>      
      </Segment>
    )
  }
  if (R.any(R.isNil, [violin])) {
    return (
      <Segment basic style={{height: '100%'}} placeholder>
        <Tada forever duration={1000}>
          <Image src={Logo} centered size='medium' />
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
    //   //     Select a feature to initialize violin plot
    //   //   </Header>
    //   // </Segment>
    //   <Segment style={{height: '100%'}} placeholder>
    //     <Shake forever duration={10000}>
    //     <Header textAlign='center' icon>
    //       <Icon name='right arrow' />
    //       Select a feature to initialize violin plot
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
    <Header textAlign='center' content='Gene Expression Violin' />
      <Plot
        config={{showTips: false}}
        data={violin}
        useResizeHandler
        style={{width: '100%', height:'90%'}}
        layout={{
          autosize: true,
          hovermode: 'closest',
          xaxis: {tickmode: 'linear', automargin: true, autorange: true, type: 'category'},
          yaxis: {showgrid: false, title: {text: 'Normalized Expression'}, automargin: true},
          margin: {l:45, r:20, b:20, t:20},
        }}
      />
    </>
  )
}

export default ViolinPlot 
