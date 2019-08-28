import React, {useState, useEffect} from 'react';

import { Icon, Input, Menu, Dropdown, Header, Segment, Button, Label, Grid, Image, Modal, Divider, Step, Card } from 'semantic-ui-react'

const CWLStatusButton = ({
  step
}) => {
  const [openModal, setOpenModal] = useState(false)
  return (
    <Modal size='large'
      open={openModal}
      trigger={
        <Step onClick={() => setOpenModal(true)}>
          <Step.Content title={step}  description='Seurat' />
        </Step>
      }
    >
      <Modal.Header content={`${step} Status`} />
      <Modal.Content scrolling>
        STDOUT goes here
      </Modal.Content>
      <Modal.Actions>
          <Button content='Close' onClick={() => setOpenModal(false)} />
      </Modal.Actions>
    </Modal>
  )
}

export default CWLStatusButton