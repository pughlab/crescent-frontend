import React, {useEffect} from 'react'
import * as R from 'ramda'
import * as R_ from 'ramda-extension'
import {Grid, Header, Icon, Image, Segment} from 'semantic-ui-react'
import Shake from 'react-reveal/Shake'
import {useResultsPage, useCrescentContext} from '../../../../redux/hooks'
import {useResultsPagePlotQuery} from '../../../../redux/hooks/useResultsPage'
import {useResultsAvailableQuery} from '../../../../apollo/hooks/results'

import FailedRunLogs from './FailedRunLogs'
import ScatterPlot from './ScatterPlot'
import ViolinPlot from './ViolinPlot'
import QCPlot from './QCPlot'
import DotPlot from './DotPlot'
import GSVAHeatmap from './GSVAHeatmap'
import InferCNVHeatmap from './InferCNVHeatmap'

import CrescentPlotCaption from './PlotCaption'

import Tada from 'react-reveal/Tada'
import Logo from '../../../login/logo.jpg'

export const CrescentPlot = ({
  plotQueryIndex
}) => {
  const {activeResult} = useResultsPagePlotQuery(plotQueryIndex)
  const isActiveResult = R.equals(activeResult)
  return (
    isActiveResult('qc') ? <QCPlot {...{plotQueryIndex}} />
    : isActiveResult('violin') ? <ViolinPlot {...{plotQueryIndex}} />
    : isActiveResult('dot') ? <DotPlot {...{plotQueryIndex}} />
    : isActiveResult('gsva') ? <GSVAHeatmap {...{plotQueryIndex}} />
    : isActiveResult('infercnv') ? <InferCNVHeatmap {...{plotQueryIndex}} />
    : (isActiveResult('tsne') || isActiveResult('umap')) && <ScatterPlot {...{plotQueryIndex}} />
  )
}

const VisualizationsComponent = () => {
  const {runID} = useCrescentContext()
  const {activeResult, activePlot, plotQueries, sidebarCollapsed, runID: compareRunID, runStatus} = useResultsPage()
  const {plots, startResultsPolling, stopResultsPolling} = useResultsAvailableQuery(runID || compareRunID)

  useEffect(() => {
    startResultsPolling(1000)
  }, [startResultsPolling])

  useEffect(() => {
    if (R.none(R.equals(runStatus), ['pending', 'submitted'])) stopResultsPolling()
  }, [runStatus, stopResultsPolling])

  if (R.and(
    R.anyPass([R.isNil, R.isEmpty])(plots),
    R.anyPass([R.isNil, R.equals('submitted')])(runStatus)
  )) {
    return (
      <Segment color="violet" style={{height: '100%'}}>
        <Segment basic placeholder style={{height: '100%'}}>
          <Tada forever duration={1000}>
            <Image centered size="medium" src={Logo} />
          </Tada>
        </Segment>
      </Segment>
    )
  }

  const runStatusEquals = R.equals(runStatus)

  if (runStatusEquals('failed')) {
    return (
      <FailedRunLogs />
    )
  }

  return (
    <>
      { R.isNil(activeResult) ? (
        <Segment color="violet" style={{height: '100%'}}>
          <Segment
            placeholder
            basic={runStatusEquals('submitted')}
            style={{height: '100%'}}
          >
            { runStatusEquals('submitted') && (
              <Tada forever duration={1000}>
                <Image
                  centered
                  size="small"
                  src={Logo}
                  style={{marginBottom: 35}}
                />
              </Tada>
            )}
            <Shake forever duration={10000}>
              <Header icon textAlign="center">
                <Icon name="right arrow" />
                Select a visualization on the right
                { runStatusEquals('submitted') && (
                  <Header.Subheader>More results will auto-populate as they become available.</Header.Subheader>
                )}
              </Header>
            </Shake>
          </Segment>
        </Segment>
      ) : (
        <>
          { R.not(sidebarCollapsed) ? (
            <Segment
              color="violet"
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '75vh'
              }}
            >
              <CrescentPlot plotQueryIndex={activePlot} />
            </Segment>
          ) : (
            <Grid columns={R_.ltThanLength(1, plotQueries) ? 2 : 1}>
              { R.addIndex(R.map)(
                (plotQuery, idx) => (
                  <Grid.Column key={idx}>
                    <Segment
                      attached="top"
                      color="violet"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '60vh'
                      }}
                    >
                      <CrescentPlot plotQueryIndex={idx} />
                    </Segment>
                    <Segment
                      compact
                      attached="bottom"
                      color="violet"
                    >
                      <CrescentPlotCaption plotQueryIndex={idx} />
                    </Segment>
                  </Grid.Column>
                ),
                plotQueries
              )}
            </Grid>
          )}
        </>
      )}
    </>
  )
}

export default VisualizationsComponent