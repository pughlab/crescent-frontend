import React, {useEffect, useState} from 'react'
import * as R from 'ramda'
import * as R_ from 'ramda-extension'
import {Header, Icon, Image, Segment, Card, Popup, Button} from 'semantic-ui-react'
import RGL, {WidthProvider} from 'react-grid-layout'
import {PlotResizeHandle} from './ResponsivePlot'
import Shake from 'react-reveal/Shake'
import Fade from 'react-reveal/Fade'
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

// CSS import for react-grid-layout
import 'react-grid-layout/css/styles.css'
const GridLayout = WidthProvider(RGL)

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
  const [isDragging, setIsDragging] = useState(false)

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
            <Fade duration={2000}>
              <Segment basic>
                <GridLayout
                  cols={100}
                  draggableHandle=".plot-draggable-handle"
                  margin={[25, 10]}
                  onDrag={() => setIsDragging(true)}
                  onDragStop={() => setIsDragging(false)}
                  resizeHandle={<PlotResizeHandle />}
                  rowHeight={1}
                >
                  { R.addIndex(R.map)(
                    (plotQuery, idx) => (
                      <div
                        key={idx}
                        data-grid={{
                          x: (idx * 50) % 100,
                          y: Math.floor(idx / 2) * 46,
                          w: 50,
                          h: 46, // Note: the height accounts for the 10px margin between every row; equaivalent to (46 * 1) + ((46 - 1) * 10) = 496px
                          minW: 33,
                          minH: 28 // Note: the minimum height accounts for the 10px margin between every row; equivalent to (28 * 1) + ((28 - 1) * 10) - 298px
                        }}
                      >
                        <Card
                          fluid
                          color="violet"
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            margin: 0
                          }}
                        >
                          <Popup
                            disabled={isDragging}
                            position="top left"
                            size="small"
                            trigger={
                              <Button
                                className="plot-draggable-handle"
                                color="violet"
                                style={{flexShrink: 0}}
                              >
                                <Icon
                                  name="arrows alternate"
                                  size="large"
                                />
                              </Button>
                            }
                          >
                            Drag to move plot
                          </Popup>
                          <Card.Content style={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            marginTop: 0,
                            overflow: 'hidden auto'
                          }}>
                            <CrescentPlot plotQueryIndex={idx} />
                          </Card.Content>
                          <Card.Content compact style={{marginBottom: 0}}>
                            <CrescentPlotCaption plotQueryIndex={idx} />
                          </Card.Content>
                        </Card>
                      </div>
                    ),
                    plotQueries
                  )}
                </GridLayout>
              </Segment>
            </Fade>
          )}
        </>
      )}
    </>
  )
}

export default VisualizationsComponent