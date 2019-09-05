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
  singleCell,
  setSingleCell,
  resolution,
  setResolution,
  principalDimensions,
  setPrincipalDimensions,
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
          isActiveParameter('sc_input_type') ?
            <SingleCellInputType
              singleCell={singleCell}
              setSingleCell={setSingleCell}
            />
          : isActiveParameter('resolution') ?
            <Resolution
              resolution={resolution}
              setResolution={setResolution}
            />
          : isActiveParameter('pca_dimensions') ?
            <PCADimensions
              principalDimensions={principalDimensions}
              setPrincipalDimensions={setPrincipalDimensions}
            />
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