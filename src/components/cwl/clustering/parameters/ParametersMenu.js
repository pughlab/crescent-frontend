import React, {useState} from 'react'

import {Grid, Menu, Segment, Message, Header, Divider} from 'semantic-ui-react'

import PARAMETERS from './Inputs'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const ClusteringParameterMenu = ({

}) => {
  const [activeParameter, setActiveParameter] = useState(null)
  // Define function that can be partially applied (i.e. curried)
  const findActiveParameterComponent = R.curry(
    // Find the parameter object that is active and get component prop
    (PARAMETERS, activeParameter) => R.compose(
      R.prop('component'),
      R.find(R.propEq('parameter', activeParameter))
    )(PARAMETERS)
  )(PARAMETERS) // Immediately pass PARAMETERS on definition
  return (
    <Grid>
      <Grid.Column width={4}>
        <Menu fluid vertical tabular>
        {
          R.map(
            ({parameter, label, component}) => (
              <Menu.Item key={parameter}
                active={activeParameter===parameter}
                onClick={() => setActiveParameter(parameter)}
              >
                <Header content={label} />
              </Menu.Item>
            ),
            PARAMETERS
          )
        }
        </Menu>
      </Grid.Column>
      <Grid.Column width={12} stretched>
      <Segment basic >
      {
          RA.isNotNil(activeParameter) ?
            findActiveParameterComponent(activeParameter)
          : <Message content='Select a parameter on the left menu' />

          // isActiveParameter('sc_input_type') ? <SingleCellInputType />
          // : isActiveParameter('resolution') ? <Resolution />
          // : isActiveParameter('gene_list') ? <GeneList />
          // : isActiveParameter('opacity') ? <Opacity />
          // : isActiveParameter('pca_dimensions') ? <PCADimensions />
          // : isActiveParameter('return_threshold') ? <ReturnThreshold />
          // : <Message content='Select a parameter on the left menu' />
      }
      </Segment>
      </Grid.Column>
    </Grid>
  )
}

export default ClusteringParameterMenu