import React, {useState} from 'react'

import {Grid, Menu, Segment, Message, Header, Divider} from 'semantic-ui-react'

import {
  PARAMETERS,
  SingleCellInputType,
  NumberGenes,
  PercentMito,
  Resolution,
  PCADimensions,
} from './Inputs'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const ClusteringParameterMenu = ({
  singleCell, setSingleCell,
  numberGenes, setNumberGenes,
  percentMito, setPercentMito,
  resolution, setResolution,
  principalDimensions, setPrincipalDimensions,
}) => {
  // TOGGLE FOR WHICH PARAMETER TO CHANGE
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

export default ClusteringParameterMenu