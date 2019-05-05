import React, {useState} from 'react'

import {Grid, Menu, Segment, Message, Header, Divider} from 'semantic-ui-react'

const makeParameter = (
  parameter, description=''
) => ({
  parameter,
  description
})

const PARAMETERS = [
  makeParameter('sc_input', '.mtx files'),
  makeParameter('sc_input_type', 'DropSeq || 10X'),
  makeParameter('resolution', 'TSNE resolution'),
  makeParameter('project_id', 'Unique name for your project'),
  makeParameter('gene_list', 'List of genes of interest'),
  makeParameter('opacity'),
  makeParameter('pca_dimensions', 'Principal Component Analysis dimensions of interest'),
  makeParameter('mitochondrial_percentage', ''),
  makeParameter('number_of_genes', 'Approximate number of genes'),
  makeParameter('return_threshold')
]

const ClusteringParameterMenu = ({

}) => {
  const [activeParameter, setActiveParameter] = useState(null)
  const activeParameterDescription = 
    activeParameter===null ?
      'Select a parameter on the left menu'
      :PARAMETERS.find(value => value.parameter===activeParameter).description
  return (
    <Grid>
      <Grid.Column width={4}>
        <Menu fluid vertical tabular>
        {
          PARAMETERS.map(
            ({parameter, description}) => (
              <Menu.Item key={parameter}
                active={activeParameter===parameter}
                onClick={() => setActiveParameter(parameter)}
              >
                <Header content={parameter} />
              </Menu.Item>
            )
          )
        }
        </Menu>
      </Grid.Column>
      <Grid.Column width={12}>
        <Message size='huge' header={activeParameterDescription} content={'Detailed description goes here'} />
        <Divider />
      </Grid.Column>
    </Grid>
  )
}

export default ClusteringParameterMenu