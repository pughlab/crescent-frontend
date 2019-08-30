import React, {useState, useEffect} from 'react';

import {Menu, Card, Header, Segment, Button, Grid, Modal, Label, Divider, Icon} from 'semantic-ui-react'

import ProjectSelectModal from '../projects/ProjectSelectModal'
import RunsSelectModal from '../projects/RunsSelectModal'

const CrescentIcon = () => (
  <Icon.Group style={{marginTop: -3}} >
    <Icon name='cloud' size='big'  />
    <Icon name='moon' size='small' inverted style={{marginTop: 2, marginLeft: -2}} />
  </Icon.Group>
)

const MenuComponent = ({
  currentRunId, setCurrentRunId,
  currentProjectID, setCurrentProjectID,
  userID
}) => {
  return (
    <Segment attached='bottom' style={{height: '8%'}} as={Menu} size='large'>
      <Menu.Item header content={<CrescentIcon />} />

      <Menu.Menu position='right'>
        <RunsSelectModal
          {...{
            currentRunId, setCurrentRunId,
            currentProjectID
          }}
        />
        <Menu.Item onClick={() => setCurrentProjectID(null)}>
          {'Projects'}
          <ProjectSelectModal 
            {...{
              currentProjectID, setCurrentProjectID,
              userID
            }}
          />
        </Menu.Item>
      </Menu.Menu>
    </Segment>
  )
}

export default MenuComponent