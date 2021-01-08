import React, {useState, useEffect, useRef} from 'react';
import * as R from 'ramda'
import * as R_ from 'ramda-extension'
import {Segment, Icon, Header, Image, Grid, Label, Divider} from 'semantic-ui-react'
import Shake from 'react-reveal/Shake'

import {useDispatch} from 'react-redux'
import {useResultsPage, useCrescentContext} from '../../../../redux/hooks'
import {useResultsPagePlotQuery} from '../../../../redux/hooks/useResultsPage'
import {useRunDetailsQuery, useResultsAvailableQuery} from '../../../../apollo/hooks'

import ScatterPlot from './ScatterPlot'
import ViolinPlot from './ViolinPlot'
import QCPlot from './QCPlot'
import DotPlot from './DotPlot'

import CrescentPlotCaption from './PlotCaption'

import Tada from 'react-reveal/Tada'
import Fade from 'react-reveal/Fade'
import Logo from '../../../login/logo.jpg'
import {ClimbingBoxLoader} from 'react-spinners'
import {Button} from 'semantic-ui-react'

const CrescentPlot = ({
  plotQueryIndex
}) => {
  const {activeResult} = useResultsPagePlotQuery(plotQueryIndex)
  const isActiveResult = R.equals(activeResult)
  return (
    isActiveResult('qc') ? <QCPlot {...{plotQueryIndex}} />
    : isActiveResult('violin') ? <ViolinPlot {...{plotQueryIndex}} />
    : isActiveResult('dot') ? <DotPlot {...{plotQueryIndex}} />
    : (isActiveResult('tsne') || isActiveResult('umap')) && <ScatterPlot {...{plotQueryIndex}} />
  )
}

const VisualizationsComponent = ({

}) => {
  const {runID} = useCrescentContext()
  const run = useRunDetailsQuery(runID)
  const plots = useResultsAvailableQuery(runID)


  const dispatch = useDispatch()
  const {activeResult, activePlot, plotQueries, sidebarCollapsed, activeSidebarTab} = useResultsPage()
  const [showLogs, setShowLogs] = useState(false)

  if (R.any(R.isNil, [run, plots])) {
    return null
  }

  const {status: runStatus} = run
  const runStatusEquals = R.equals(runStatus)

  if (runStatusEquals('failed')) {
    return (
      <Segment color='violet' placeholder>
        <Shake forever duration={10000}>
        <Header textAlign='center' icon>
          <Icon name='right arrow' />
          Download and review failed run logs
        </Header>  
        </Shake>      
      </Segment>
    )
  }

  if (R.isEmpty(plots)) {
    return (
      <Segment style={{height: '100%'}} color='violet'>
        <Segment style={{height: '100%'}} basic placeholder>
          <Tada forever duration={1000}>
            <Image src={Logo} centered size='medium' />
          </Tada>
        </Segment>
      </Segment>
    )
  }

  return (
    <>
    {
      R.isNil(activeResult) ?
        <Segment color='violet' placeholder>
          <Shake forever duration={10000}>
          <Header textAlign='center' icon>
            <Icon name='right arrow' />
            Select a visualization on the right
          </Header>  
          </Shake>      
        </Segment>
      : (
        <>
        {
          R.not(sidebarCollapsed) ?
            <Segment style={{height: '75vh'}} color='violet'>
              <CrescentPlot plotQueryIndex={activePlot} />
            </Segment>
          :
            <Grid columns={R_.ltThanLength(1, plotQueries) ? 2 : 1}>
            {
              R.addIndex(R.map)(
                (plotQuery, idx) => (
                  <Grid.Column key={idx}>
                  <Segment style={{height: '60vh'}} color='violet' attached='top'>
                    <CrescentPlot plotQueryIndex={idx} />
                  </Segment>
                  <Segment attached='bottom' compact>
                    <CrescentPlotCaption plotQueryIndex={idx} />
                  </Segment>
                  </Grid.Column>
                ),
                plotQueries
              )
            }
            </Grid>
        }
        </>
      )
    }
    </>
  )
}

export default VisualizationsComponent