import React, {useState, useEffect} from 'react';

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import moment from 'moment'

import filesize from 'filesize'

import {Form, Card, Header, Transition, Button, Container, Segment, Modal, Label, Divider, Icon, Image, Popup, Message} from 'semantic-ui-react'

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
    datasetSize,

    mergedProjects,
    uploadedDatasets,

    cancerTag,
    oncotreeTissue: {name: oncotreeTissueName}
  } = project
  console.log(project)


  return (
    <Transition visible animation='fade up' duration={500} unmountOnHide={true} transitionOnMount={true}>
      <Card link onClick={() => setProject(project)} color='grey'>
        <Popup
            size='large' wide='very'
            trigger={
              <Button attached='top' color='grey' animated='vertical'>
                <Button.Content>
                  <Icon name='folder open' size='large' />
                </Button.Content>
              </Button>
            }
            content={
              <Segment>
                {description}
              </Segment>
            }
          />
        <Card.Content>
          <Card.Header>
            <Header size='small'>
              <Header.Content>
              {name}
              </Header.Content>
            </Header>
          </Card.Header>
        </Card.Content>
        <Card.Content>
          <Label.Group size='small'>
            <Label content={<Icon style={{margin: 0}} name='user' />} detail={creatorName} />
            <Label content={<Icon style={{margin: 0}} name='calendar alternate outline' />} detail={moment(createdOn).format('DD MMM YYYY')} />
            {/* <Label content={<Icon style={{margin: 0}} name='certificate' />} detail={'1000000'} /> */}
            {/* <Label content={<Icon style={{margin: 0}} name='save' />} detail={filesize(datasetSize)} /> */}
            {/* <Label content={<Icon style={{margin: 0}} name='hashtag' />} detail='cancer' />
            <Label content={<Icon style={{margin: 0}} name='hashtag' />} detail='mouse' /> */}

            {
              RA.isNotEmpty(mergedProjects) &&
              <Label content={<Icon style={{margin: 0}} name='folder open' />} detail={R.length(mergedProjects)} />
            }
            {
              RA.isNotEmpty(uploadedDatasets) &&
              <Label content={<Icon style={{margin: 0}} name='upload' />} detail={R.length(uploadedDatasets)} />
            }
          </Label.Group>
          <Label.Group size='small' color='blue'>
            <Label content={<Icon style={{margin: 0}} name='hashtag' />} detail={cancerTag ? 'Cancer' : 'Non-cancer'} />
            <Label content={<Icon style={{margin: 0}} name='hashtag' />} detail={oncotreeTissueName} />
          </Label.Group>
        </Card.Content>
        {
          R.ifElse(
            R.isEmpty,
            R.always(null),
            runs => (
              <Card.Content>
                <Label.Group size='small'>
                {
                  R.compose(
                    R.flatten,
                    R.props(['pending', 'submitted', 'completed', 'failed']),
                    R.mapObjIndexed((runs, status) => {
                      const statusColor = R.prop(status, {
                        pending: 'orange',
                        submitted: 'yellow',
                        completed: 'green',
                        failed: 'red'
                      })
                      if (R.isEmpty(runs)) {
                        return null
                      }
                      return (
                        <Label key={status} color={statusColor}>
                          <Icon
                            name={R.prop(status, {
                              pending: 'circle outline',
                              submitted: 'circle notch',
                              completed: 'circle outline check',
                              failed: 'times circle outline'
                            })}
                            loading={R.equals('submitted', status)}
                          />
                          {R.length(runs)}
                          {' '}
                          {R.toUpper(status)}
                        </Label>
                      )
                    }),
                    R.reduce(
                      (runsByStatus, run) => R.over(
                        R.lensProp(R.prop('status', run)),
                        R.append(run),
                        runsByStatus
                      ),
                      {pending: [], submitted: [], completed: [], failed: []}
                    )
                  )(runs)
                }
                </Label.Group>
              </Card.Content>
            )
          )(runs)
        }
      </Card>
    </Transition>
  )
})


export default ProjectCard