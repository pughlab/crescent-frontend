import React, {Fragment} from 'react'

import tsne from './tsne.png'

import {Image, Divider} from 'semantic-ui-react'

const ClusteringVisualization = ({

}) => {

  return (
    <Fragment>
      <Image size='medium' src={tsne} />
    </Fragment>
  )
}

export default ClusteringVisualization