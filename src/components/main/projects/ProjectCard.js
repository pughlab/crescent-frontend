import React, {useState, useEffect} from 'react';

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import moment from 'moment'

import {Form, Card, Header, Transition, Button, Container, Modal, Label, Divider, Icon, Image, Popup} from 'semantic-ui-react'

import withRedux from '../../../redux/hoc'

import Marquee from 'react-marquee'

const ProjectCard = withRedux(({
  // Redux
  actions: {setProject},
  // Prop
  project
}) => {
  const {
    projectID,
    name,
    description,
    createdBy: {name: creatorName},
    createdOn
  } = project
  return (
    <Transition visible animation='fade down' duration={500} unmountOnHide={true} transitionOnMount={true}>
    <Card link onClick={() => setProject(project)}>
      <Card.Content>
        <Label attached='top' color='black'>
          <Icon name='folder open' size='large' style={{margin: 0}} />
        </Label>
        <Card.Header>
          <Marquee text={name} />
        </Card.Header>
      </Card.Content>
      <Card.Content extra content={`Created by ${creatorName} on ${moment(createdOn).format('D MMMM YYYY')}`} />
    </Card>
    </Transition>
  )
})


export default ProjectCard