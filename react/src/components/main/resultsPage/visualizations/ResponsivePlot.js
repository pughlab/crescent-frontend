import React, {useEffect, useRef, useState} from 'react'
import {Icon, Segment} from 'semantic-ui-react'
import {withSize} from 'react-sizeme'
import Plot from 'react-plotly.js'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

export const PlotResizeHandle = React.forwardRef(({handleAxis, ...props}, ref) => {
  return (
    <div
      {...props}
      className={`react-resizable-handle react-resizable-handle-${handleAxis}`}
      ref={ref}
      style={{
        width: 'auto',
        height: 'auto',
        padding: 1
      }}
    >
      <Icon
        color="grey"
        name="expand arrows alternate"
        size="large"
        style={{
          width: 'auto',
          height: 'auto',
          margin: 0,
          transform: 'scale(0.65)'
        }}
      />
    </div>
  )
})

export const ResponsivePlotSegment = ({children, style={}, ...props}) => {
  const {minHeight, ...styleRest} = style
  
  return (
    <Segment
      {...props}
      basic
      style={{
        ...styleRest,
        height: '100%',
        minHeight: minHeight ? minHeight : 200,
        overflow: 'auto', // overflow added in rebase 
        padding: 0 // padding added in rebase 
      }}
    >
      {children}
    </Segment>
  )
}

const ResponsivePlot = ({automargin: automarginEnabled=false, layout, size, style={}, ...props}) => {
  const {xaxis, yaxis} = layout
  const {height, ...styleRest} = style
  const plotRef = useRef(null)
  // Disable automargin until the plot has been initialized to prevent "Too many auto-margin redraws" warnings
  const [automargin, setAutomargin] = useState(false)

  useEffect(() => {
    if (R.all(RA.isNotNil)([plotRef.current, plotRef.current.resizeHandler])) plotRef.current.resizeHandler()
  }, [size.width, size.height])

  return (
    <Plot
      {...props}
      layout={{
        ...layout,
        autosize: true,
        xaxis: {
          ...xaxis,
          automargin
        },
        yaxis: {
          ...yaxis,
          automargin
        }
      }}
      onInitialized={() => {
        // Enable automargin now that the plot has been initialized
        automarginEnabled && setAutomargin(true)
      }}
      ref={plotRef}
      style={{
        ...styleRest,
        width: '100%',
        height: height ? height : '100%',
        overflow: 'hidden'
      }}
      useResizeHandler
    />
  )
}

export default withSize({
  monitorHeight: true,
  refreshRate: 500
})(ResponsivePlot)