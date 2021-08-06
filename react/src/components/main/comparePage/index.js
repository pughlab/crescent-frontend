import React, {useEffect} from 'react'
import * as R from 'ramda'

import {Segment, Grid} from 'semantic-ui-react'
import Fade from 'react-reveal/Fade'
import {CrescentPlot} from '../resultsPage/visualizations/'
import PlotCaption from './PlotCaption'

import {useDispatch} from 'react-redux'
import {useResultsPage, useComparePage} from '../../../redux/hooks'
import {resetResultsPage, addPlots} from '../../../redux/actions/resultsPage'
import {resetComparePage} from '../../../redux/actions/comparePage'

const ComparePageComponent = ({

}) => {
  const dispatch = useDispatch()
  const {plotQueries} = useResultsPage()
  const {plotQueries: cachedPlotQueries} = useComparePage()

  useEffect(() => {
    // on compare page unmount, reset results page to remove all plots
    return () => dispatch(resetResultsPage())
  }, []);
  useEffect(() => {
    if(R.isEmpty(plotQueries)){
      // add all cached plots back
      dispatch(addPlots({value: cachedPlotQueries}))
      dispatch(resetComparePage())
    }
  })

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