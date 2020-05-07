import React from 'react'

import {Segment, Transition} from 'semantic-ui-react'

const ParametersComponent = ({

}) => {

  return (
    <Transition visible animation='fade left' duration={1000} unmountOnHide={true} transitionOnMount={true}>
    <Segment style={{height: '100%'}} color='blue'>
      parameters
    </Segment>
    </Transition>
  )
}

export default ParametersComponent