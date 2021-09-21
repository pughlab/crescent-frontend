import React from 'react'
import {Icon, Segment} from 'semantic-ui-react'
import {withSize} from 'react-sizeme'
import Plot from 'react-plotly.js'

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
        minHeight: minHeight ? minHeight : 200
      }}
    >
      {children}
    </Segment>
  )
}

const ResponsivePlot = ({layout, size, style={}, ...props}) => {
  const {height, ...styleRest} = style

  return (
    <Plot
      {...props}
      style={{
        ...styleRest,
        width: '100%',
        height: height ? height : '100%',
      }}
      layout={{
        ...layout,
        width: size.width,
        height: size.height
      }}
    />
  )
}

export default withSize({
  monitorHeight: true,
  refreshMode: 'debounce',
  refreshRate: 100
})(ResponsivePlot)