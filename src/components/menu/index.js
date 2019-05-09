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
          <Menu.Item
            header
            // content='CReSCENT'
          >
            <CrescentIcon />
            {`CReSCENT`}
          </Menu.Item>

          {/* <Menu.Menu position='right'>
            <Button.Group>
              <Button content='Parameters' />
              <Button content='Status' />
              <Button content='Results' />
            </Button.Group>
          </Menu.Menu> */}

          {/* <Menu.Menu position='right'>

          {
            [
              {step: 'Alignment', icon: 'align justify'},
              {step: 'Normalization', icon: 'align center'},
              {step: 'Clustering', icon: 'hubspot'}
            ].map(
              ({step, icon}) => (
                <Menu.Item key={step}>
                  <Button.Group>
                    <CWLStepButton step={step} icon={icon}
                      setVisContent={setVisContent}
                    />
                    <Popup
                      on='hover'
                      trigger={<Button icon='exclamation' color='blue' loading onClick={() => setVisContent(step)} />}
                      content='Click for results'
                    />
                  </Button.Group>
                </Menu.Item>
              )
            )
          }


          </Menu.Menu> */}
        </Segment>
  )
}

export default MenuComponent