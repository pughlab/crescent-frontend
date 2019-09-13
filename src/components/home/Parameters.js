import React, {useState} from 'react'

import * as R from 'ramda'

import {Grid, Menu, Segment, Message, Header, Divider} from 'semantic-ui-react'

import withRedux from '../../redux/hoc'
import {
  PARAMETERS,
  SingleCellInputType,
  NumberGenes,
  PercentMito,
  Resolution,
  PCADimensions,
} from '../cwl/clustering/parameters/Inputs'

const ParametersComponent = withRedux(
  ({
    app: {
      sidebar: {
        parameters
      }
    },
    actions: {
      setParameters
    }
  }) => {
    const {
      singleCell,
      numberGenes,
      percentMito,
      resolution,
      principalDimensions,
    } = parameters
    const mergeAndSetParameters = R.compose(
      setParameters,
      R.mergeRight(parameters),
    )      
    const setSingleCell = singleCell => mergeAndSetParameters({singleCell})
    const setNumberGenes = numberGenes => mergeAndSetParameters({numberGenes})
    const setPercentMito = percentMito => mergeAndSetParameters({percentMito})
    const setResolution = resolution => mergeAndSetParameters({resolution})
    const setPrincipalDimensions = principalDimensions => mergeAndSetParameters({principalDimensions})

    const [activeParameter, setActiveParameter] = useState(null)
    const isActiveParameter = R.equals(activeParameter)

    return (
      <Segment color='blue'>
      <Header textAlign='center' content='Set pipeline parameters' />
      <Grid>
        <Grid.Column width={12} stretched>
        <Segment basic >
        {
            isActiveParameter('sc_input_type') ?
              <SingleCellInputType {...{singleCell, setSingleCell}} />
            : isActiveParameter('number_genes') ?
              <NumberGenes {...{numberGenes, setNumberGenes}} />
            : isActiveParameter('percent_mito') ?
              <PercentMito {...{percentMito, setPercentMito}} />
            : isActiveParameter('resolution') ?
              <Resolution {...{resolution, setResolution}} />
            : isActiveParameter('pca_dimensions') ?
              <PCADimensions {...{principalDimensions, setPrincipalDimensions}} />
            : null
        }
        </Segment>
        </Grid.Column>
        <Grid.Column width={4}>
          <Menu fluid vertical tabular='right'>
          {
            R.map(
              // prompt and description used for input components
              ({parameter, label, prompt, description}) => (
                <Menu.Item key={parameter}
                  active={isActiveParameter(parameter)}
                  onClick={() => setActiveParameter(parameter)}
                  content={label}
                />
              ),
              PARAMETERS
            )
          }
          </Menu>
        </Grid.Column>
      </Grid>
      </Segment>
    )
  }
)

export default ParametersComponent