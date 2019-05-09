import React, {useState, createRef, Fragment, useEffect} from 'react';

import {Menu, Popup, Header, Segment, Button, Grid, Modal, Label, Divider, Icon} from 'semantic-ui-react'

import ClusteringParameterMenu from '../cwl/clustering/parameters/ParametersMenu'


const CWLStepButton = ({
  step,
  icon
}) => {
  return (
    <Modal size='large'
      trigger={
        <Button icon={icon} content={step} />
      }
    >
      <Modal.Header content={step} />
      <Modal.Content scrolling>
        <Segment placeholder>
          <ClusteringParameterMenu />
        </Segment>
      </Modal.Content>
      <Modal.Actions>
        <Button content='Call API HERE'
          onClick={() => console.log('Submitted parameters')}
        />

      </Modal.Actions>
    </Modal>
  )
}

const CrescentIcon = () => (
  <Icon.Group style={{marginTop: -3}} >
    <Icon name='cloud' size='big'  />
    <Icon name='moon' size='small' inverted style={{marginTop: 2, marginLeft: -2}} />
  </Icon.Group>
)

const MenuComponent = ({
  visContent,
  setVisContent
}) => {

  return (
        <Segment attached='bottom' style={{height: '10%'}} as={Menu} size='massive'>
          <Menu.Item header>
            <CrescentIcon />
            {`CReSCENT`}
          </Menu.Item>

          <Menu.Menu position='right'>
            <Menu.Item content='Projects' />
            <Menu.Item content='Explore' />
          </Menu.Menu>
        </Segment>
  )
}

export default MenuComponent