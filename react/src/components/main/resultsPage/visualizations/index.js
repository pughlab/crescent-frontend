import React from 'react'
import * as R from 'ramda'
import * as R_ from 'ramda-extension'
import {Segment, Icon, Header, Image, Grid, Label} from 'semantic-ui-react'
import Shake from 'react-reveal/Shake'

import {useDispatch} from 'react-redux'
import {useResultsPage, useCrescentContext} from '../../../../redux/hooks'
import {useResultsPagePlotQuery} from '../../../../redux/hooks/useResultsPage'
import {useRunDetailsQuery, useResultsAvailableQuery} from '../../../../apollo/hooks'

import ScatterPlot from './ScatterPlot'
import ViolinPlot from './ViolinPlot'
import QCPlot from './QCPlot'

import Tada from 'react-reveal/Tada'
import Fade from 'react-reveal/Fade'
import Logo from '../../../login/logo.jpg'
import {ClimbingBoxLoader} from 'react-spinners'

const CrescentPlot = ({
  plotQueryIndex
}) => {
  const {activeResult} = useResultsPagePlotQuery(plotQueryIndex)
  const isActiveResult = R.equals(activeResult)
  return (
    isActiveResult('qc') ? <QCPlot {...{plotQueryIndex}} />
    : isActiveResult('violin') ? <ViolinPlot {...{plotQueryIndex}} />
    : (isActiveResult('tsne') || isActiveResult('umap')) && <ScatterPlot {...{plotQueryIndex}} />
  )
}

const CrescentPlotCaption = ({
  plotQueryIndex
}) => {
  const plotQuery = useResultsPagePlotQuery(plotQueryIndex)
  const {
    activeResult,
    // selectedQC: 'Before_After_Filtering',
    // selectedFeature: null,
    // selectedGroup: null,
    // selectedDiffExpression: 'All',
    // selectedQCDataset: null,
    selectedDiffExpression,
    selectedGroup,
    selectedFeature

  } = plotQuery

  const labels = R.compose(
    R.reject(R.where({detail: R.isNil}))
  )([
    {content: 'Plot', detail: R.toUpper(activeResult)},
    {content: 'Dataset', detail: selectedDiffExpression},
    {content: 'Colour by', detail: selectedGroup},
    {content: 'Feature', detail: selectedFeature},
  ])

  return (
    <Label.Group color='violet'>
      <Label ribbon content={`${R.inc(plotQueryIndex)}`} />
      {
        R.map(({content, detail}) => <Label {...{key: content, content, detail}} />, labels)
      }
    </Label.Group>
  )
}

const VisualizationsComponent = ({

}) => {
  const {runID} = useCrescentContext()
  const run = useRunDetailsQuery(runID)

  const dispatch = useDispatch()
  const {activeResult, activePlot, plotQueries, sidebarCollapsed} = useResultsPage()

  if (R.any(R.isNil, [run])) {
    return null
  }

  const {status: runStatus} = run

  return (
    <>
    {
      R.equals('submitted', runStatus) ?
        <Segment style={{height: '100%'}} color='violet'>
          <Segment style={{height: '100%'}} basic placeholder>
            <Tada forever duration={1000}>
              <Image src={Logo} centered size='medium' />
            </Tada>
          </Segment>
        </Segment>
      : R.isNil(activeResult) ?
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