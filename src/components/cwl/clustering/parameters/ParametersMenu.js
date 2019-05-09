import React, {useState} from 'react'

import {Grid, Menu, Segment, Message, Header, Divider} from 'semantic-ui-react'

import {
  PARAMETERS,
  SingleCellInputType,
  Resolution,
  GeneList,
  Opacity,
  PCADimensions,
  ReturnThreshold,

} from './Inputs'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const ClusteringParameterMenu = ({

}) => {
  // WORKFLOW PARAMETERS
  const [singleCell, setSingleCell] = useState('DropSeq')
  const [resolution, setResolution] = useState(1)
  const [genes, setGenes] = useState(['MALAT1', 'GAPDH'])
  const [opacity, setOpacity] = useState(0.1)
  const [principalDimensions, setPrincipalDimensions] = useState(10)
  const [returnThreshold, setReturnThreshold] = useState(0.01)

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
          : isActiveParameter('gene_list') ?
            <GeneList
              genes={genes}
              setGenes={setGenes}
            />
          : isActiveParameter('opacity') ?
            <Opacity
              opacity={opacity}
              setOpacity={setOpacity}
            />
          : isActiveParameter('pca_dimensions') ?
            <PCADimensions
              principalDimensions={principalDimensions}
              setPrincipalDimensions={setPrincipalDimensions}
            />
          : isActiveParameter('return_threshold') ?
            <ReturnThreshold
              returnThreshold={returnThreshold}
              setReturnThreshold={setReturnThreshold}
            />
          : <Message content='Select a parameter on the left menu' />
      }
      </Segment>
      </Grid.Column>
    </Grid>
  )
}

export default ClusteringParameterMenu