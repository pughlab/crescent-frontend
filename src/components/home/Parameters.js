import React from 'react'


import withRedux from '../../redux/hoc'
import ClusteringParameterMenu from '../cwl/clustering/parameters/ParametersMenu'

const ParametersComponent = withRedux(
  ({
    singleCell, setSingleCell,
    numberGenes, setNumberGenes,
    percentMito, setPercentMito,
    resolution, setResolution,
    principalDimensions, setPrincipalDimensions
  }) => {
    return (
      <ClusteringParameterMenu
        {...{
          singleCell, setSingleCell,
          numberGenes, setNumberGenes,
          percentMito, setPercentMito,
          resolution, setResolution,
          principalDimensions, setPrincipalDimensions
        }}
      />
    )
  }
)

export default ParametersComponent