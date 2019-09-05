import React, {useState} from 'react'

import {Grid, Menu, Segment, Message, Header, Divider} from 'semantic-ui-react'

import {
  PARAMETERS,
  SingleCellInputType,
  Resolution,
  PCADimensions,
} from './Inputs'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const ClusteringParameterMenu = ({
  singleCell, setSingleCell,
  resolution, setResolution,
  principalDimensions, setPrincipalDimensions,
}) => {
  // TOGGLE FOR WHICH PARAMETER TO CHANGE
  const [activeParameter, setActiveParameter] = useState(null)
  const isActiveParameter = R.equals(activeParameter)
  return (
    <Grid>
      <Grid.Column width={4}>
        <Menu fluid vertical tabular>
        {
          R.map(
            // prompt and description used for input components
            ({parameter, label, prompt, description}) => (
              <Menu.Item key={parameter}
                active={isActiveParameter(parameter)}
                onClick={() => setActiveParameter(parameter)}
                content={<Header content={label} />}
              />
            ),
            PARAMETERS
          )
        }
        </Menu>
      </Grid.Column>
      <Grid.Column width={12} stretched>
      <Segment basic >
      {
          isActiveParameter('sc_input_type') ?
            <SingleCellInputType {...{singleCell, setSingleCell}} />
          : isActiveParameter('resolution') ?
            <Resolution {...{resolution, setResolution}} />
          : isActiveParameter('pca_dimensions') ?
            <PCADimensions {...{principalDimensions, setPrincipalDimensions}} />
          :
            <Segment placeholder>
              <Header textAlign='center' content='Select a parameter on the left menu' />
            </Segment>
      }
      </Segment>
      </Grid.Column>
    </Grid>
  )
}

export default ClusteringParameterMenu