import React, {useState, useEffect} from 'react';

import { Icon, Input, Menu, Dropdown, Header, Segment, Button, Label, Grid, Image, Modal, Divider, Step, Card } from 'semantic-ui-react'

import ClusteringParameterMenu from '../cwl/clustering/parameters/ParametersMenu'


const CWLParamsButton = ({
  step,

  singleCell, setSingleCell,
  resolution, setResolution,
  principalDimensions, setPrincipalDimensions,
}) => {
  const [openModal, setOpenModal] = useState(false)
  const [tool, setTool] = useState('seurat')
  return (
    <div>
    <Modal size='large' open={openModal}
      trigger={
        <Step onClick={() => setOpenModal(true)}>
          <Step.Content title={step} description={'Seurat'} />
        </Step>
      }
    >
      <Modal.Header>
        <Dropdown fluid selection
          placeholder='Select Friend'
          options={[{key: 'seurat', text: 'Seurat', value:'seurat'}]}
          value={tool}
        />
      </Modal.Header>
      <Modal.Content scrolling>
        <ClusteringParameterMenu
          {...{
            singleCell, setSingleCell,
            resolution, setResolution,
            principalDimensions, setPrincipalDimensions
          }}
        />
      </Modal.Content>
      <Modal.Actions>
        <Button content='Close' onClick={() => setOpenModal(false)} />
      </Modal.Actions>
    </Modal>
    </div>
  )
} 

export default CWLParamsButton