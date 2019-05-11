import React, {useState, createRef, useEffect} from 'react';

import {Menu, Card, Header, Segment, Button, Grid, Modal, Label, Divider, Icon} from 'semantic-ui-react'

import * as R from 'ramda'

const CrescentIcon = () => (
  <Icon.Group style={{marginTop: -3}} >
    <Icon name='cloud' size='big'  />
    <Icon name='moon' size='small' inverted style={{marginTop: 2, marginLeft: -2}} />
  </Icon.Group>
)

const RunsModal = ({

}) => {
  const [openModal, setOpenModal] = useState(false)
  return (
    <Modal size='large'
      open={openModal}
      trigger={
        <Menu.Item content='Runs' onClick={() => setOpenModal(true)}/>
      }
    > 
      <Modal.Header content="Runs" />
      <Modal.Content>
        <Card.Group itemsPerRow={3}>
        {
          R.compose(
            R.map(
              n => (
                <Card key={n}
                  header={n}
                  description='Description'
                />
              )
            ),
            R.times(R.identity)
          )(10)
        }
        </Card.Group>
      </Modal.Content>
      <Modal.Actions>
        <Button content='Close' onClick={() => setOpenModal(false)} />
      </Modal.Actions>
    </Modal>
  )
}

const MenuComponent = ({

}) => {

  return (
    <Segment attached='bottom' style={{height: '10%'}} as={Menu} size='huge'>
      <Menu.Item header>
        <CrescentIcon />
        {`CReSCENT`}
      </Menu.Item>

      <Menu.Menu position='right'>
        <RunsModal />
      </Menu.Menu>
    </Segment>
  )
}

export default MenuComponent