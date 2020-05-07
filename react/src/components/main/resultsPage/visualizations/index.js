import React from 'react'

import {Segment, Transition} from 'semantic-ui-react'

const VisualizationsComponent = ({

}) => {

  return (
    <Transition visible animation='fade left' duration={1000} unmountOnHide={true} transitionOnMount={true}>
    <Segment style={{height: '100%'}} color='violet'>
      visualization
    </Segment>
    </Transition>
  )
}

export default VisualizationsComponent