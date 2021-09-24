import React, {useEffect} from 'react'
import * as R from 'ramda'

import {Segment, Grid} from 'semantic-ui-react'
import Fade from 'react-reveal/Fade'
import {CrescentPlot} from '../resultsPage/visualizations/'
import PlotCaption from './PlotCaption'

import {useDispatch} from 'react-redux'
import {useResultsPage, useComparePage} from '../../../redux/hooks'
import {resetResultsPage, initializePlots} from '../../../redux/actions/resultsPage'

const ComparePageComponent = ({

}) => {
  const dispatch = useDispatch()
  const {plotQueries} = useResultsPage()
  const {plotQueries: selectedPlotQueries, selectedPlotID} = useComparePage()

  useEffect(() => {
    // on compare page unmount, reset results page to remove all plots
    return () => dispatch(resetResultsPage())
  }, [])

  useEffect(() => {
    // on compare page mount, initialized the plots
    dispatch(initializePlots({value: selectedPlotQueries, selectedPlotID}))
  }, [])

  return (
    <Fade duration={2000}>
      <Segment basic>
        <Grid columns={2}>
          {
            R.addIndex(R.map)(
              (plotQuery, idx) => (
                <Grid.Column key={idx}>
                  <Segment style={{height: '60vh'}} color='violet' attached='top'>
                    <CrescentPlot plotQueryIndex={idx} />
                  </Segment>
                  <Segment attached='bottom' compact>
                    <PlotCaption plotQueryIndex={idx} />
                  </Segment>
                </Grid.Column>
              ),
              plotQueries
            )
          }
        </Grid>
      </Segment>
    </Fade>
  )
}

export default ComparePageComponent