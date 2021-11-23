import React, {useEffect, useState} from 'react'
import * as R from 'ramda'

import {Button, Card, Icon, Popup, Segment} from 'semantic-ui-react'
import RGL, {WidthProvider} from 'react-grid-layout'
import {PlotResizeHandle} from '../resultsPage/visualizations/ResponsivePlot'
import Fade from 'react-reveal/Fade'
import {CrescentPlot} from '../resultsPage/visualizations/'
import PlotCaption from './PlotCaption'

import {useDispatch} from 'react-redux'
import {useResultsPage, useComparePage} from '../../../redux/hooks'
import {resetResultsPage, initializePlots} from '../../../redux/actions/resultsPage'

// CSS import for react-grid-layout
import 'react-grid-layout/css/styles.css'

const GridLayout = WidthProvider(RGL)

const ComparePageComponent = () => {
  const dispatch = useDispatch()
  const {plotQueries} = useResultsPage()
  const {plotQueries: selectedPlotQueries, selectedPlotID} = useComparePage()
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    // On compare page mount, initialize the plots
    dispatch(initializePlots({value: selectedPlotQueries, selectedPlotID}))

    // On compare page unmount, reset results page to remove all plots
    return () => dispatch(resetResultsPage())
  }, [dispatch, selectedPlotID, selectedPlotQueries])
  
  return (
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
                    <PlotCaption plotQueryIndex={idx} />
                  </Card.Content>
                </Card>
              </div>
            ),
            plotQueries
          )}
        </GridLayout>
      </Segment>
    </Fade>
  )
}

export default ComparePageComponent