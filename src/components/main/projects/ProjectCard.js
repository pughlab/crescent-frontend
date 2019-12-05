import React, {useState, useEffect} from 'react';

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import * as R_ from 'ramda-extension'
import moment from 'moment'

import filesize from 'filesize'

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
    createdOn,

    runs,
    // Has props
    // {
    //   runID,
    //   name,
    //   status
    // }
    datasetSize
  } = project
  return (
    <Transition visible animation='fade up' duration={500} unmountOnHide={true} transitionOnMount={true}>
    <Card link onClick={() => setProject(project)} color='grey'>
      <Card.Content>
        <Label attached='top' color='grey'>
          <Icon name='folder open' size='large' style={{marginLeft: 0}} />
          {filesize(datasetSize)}
        </Label>
        <Card.Header>
          <Header size='small'>
            <Marquee text={name} />
          </Header>
        </Card.Header>
      </Card.Content>
      <Card.Content extra content={description} />
      <Card.Content extra content={`Created by ${creatorName} on ${moment(createdOn).format('D MMMM YYYY')}`} />
      <Card.Content>
        <Button.Group widths={3}>
        {
          R.compose(
            R.flatten,
            R.props(['pending', 'submitted', 'completed']),
            R.mapObjIndexed((runs, status) => {
              const statusColor = R.prop(status, {
                pending: 'orange',
                submitted: 'yellow',
                completed: 'green'
              })
              return (
                <Popup key={status} inverted size='large'
                  wide='very'
                  trigger={
                    <Button
                      animated='vertical'
                      size='small'
                      color={statusColor}
                    >
                      <Button.Content visible
                        content={
                          R_.joinWithSpace([
                            R.length(runs),
                            R.toUpper(status),
                          ])
                        }
                      />
                      <Button.Content hidden
                        content={
                          <Icon name={R.prop(status, {
                            pending: 'circle outline',
                            submitted: 'circle notch',
                            completed: 'circle outline check'
                          })} />
                        }
                      />
                    </Button>
                  }
                  content={
                    <Label.Group>
                    {
                      R.ifElse(
                        R.isEmpty,
                        R.always(`No ${status} runs`),
                        RA.mapIndexed(
                          ({runID, name}, index) => (
                            <Label key={index}>
                              {name}
                            </Label>
                          )
                        )
                      )(runs)
                    }
                    </Label.Group>  
                  }
                />
              )
            }),
            R.reduce(
              (runsByStatus, run) => R.over(
                R.lensProp(R.prop('status', run)),
                R.append(run),
                runsByStatus
              ),
              {pending: [], submitted: [], completed: []}
            )
          )(runs)
        }
        </Button.Group>
      </Card.Content>
    </Card>
    </Transition>
  )
})


export default ProjectCard