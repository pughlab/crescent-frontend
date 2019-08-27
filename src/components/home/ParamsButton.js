import React, {useState, useEffect} from 'react';

import { Icon, Input, Menu, Dropdown, Header, Segment, Button, Label, Grid, Image, Modal, Divider, Step, Card } from 'semantic-ui-react'

import ClusteringParameterMenu from '../cwl/clustering/parameters/ParametersMenu'


const CWLParamsButton = ({
  step,

  singleCell, setSingleCell,
  resolution, setResolution,
  genes, setGenes,
  opacity, setOpacity,
  principalDimensions, setPrincipalDimensions,
  returnThreshold, setReturnThreshold,
}) => {
  const [openModal, setOpenModal] = useState(false)
  const [tool, setTool] = useState('seurat')
  return (
    <div>
    <Modal size='large'
      open={openModal}
      trigger={
        <Step onClick={() => setOpenModal(true)}>
          <Step.Content title={step} description={'Seurat'} />
        </Step>
      }
    >
      <Modal.Header>
        <Dropdown
          placeholder='Select Friend'
          fluid
          selection
          options={[
            {key: 'seurat', text: 'Seurat', value:'seurat'}
          ]}
          value={tool}
        />
      </Modal.Header>
      <Modal.Content scrolling>
        <ClusteringParameterMenu
          singleCell={singleCell} setSingleCell={setSingleCell}
          resolution={resolution} setResolution={setResolution}
          genes={genes} setGenes={setGenes}
          opacity={opacity} setOpacity={setOpacity}
          principalDimensions={principalDimensions} setPrincipalDimensions={setPrincipalDimensions}
          returnThreshold={returnThreshold} setReturnThreshold={setReturnThreshold}
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