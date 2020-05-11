import React, {useState, useEffect} from 'react';

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import * as R_ from 'ramda-extension'
import moment from 'moment'

import filesize from 'filesize'

import {Form, Card, Header, Transition, Button, Container, Segment, Modal, Label, Divider, Icon, Image, Popup, Message} from 'semantic-ui-react'

import Marquee from 'react-marquee'

import {useDispatch} from 'react-redux'
import {setProject} from '../../../redux/actions/context'
import {useProjectDetailsQuery} from '../../../apollo/hooks'

const ProjectCard = ({
  // Prop
  projectID
}) => {
  const dispatch = useDispatch()
  const project = useProjectDetailsQuery(projectID)

  if (R.isNil(project)) {
    return null
  }

  const {
    name,
    description,
    createdBy: {name: creatorName},
    createdOn,

    runs, // {runID, name, status}

    mergedProjects,
    uploadedDatasets,

    allDatasets
  } = project

  return (
    <Transition visible animation='fade up' duration={500} unmountOnHide={true} transitionOnMount={true}>
      <Card link color='grey'
        onClick={() => dispatch(setProject({projectID}))}
      >
        <Popup
            size='huge' wide='very'
            trigger={
              <Button attached='top' color='grey' animated='vertical'>
                <Button.Content>
                  <Icon name='folder open' size='large' />
                </Button.Content>
              </Button>
            }
            content={
              <>
                <Segment>
                  {description}
                </Segment>
              <Segment.Group>
                <Segment>
                  <Label.Group>
                    <Label>
                      <Icon name='user' />
                      {'Created by'}
                      <Label.Detail content={creatorName} />
                    </Label>
                    <Label >
                      <Icon name='calendar alternate outline' />
                      {'Created on'}
                      <Label.Detail content={moment(createdOn).format('D MMMM YYYY')} />
                    </Label>
                  </Label.Group>
                </Segment>

                <Segment>
                  <Label.Group>
                    {
                      RA.isNotEmpty(mergedProjects) &&
                      <Label>
                        <Icon name='folder open' />
                        {'Merged Projects'}
                        <Label.Detail content={R.length(mergedProjects)} />
                      </Label>
                    }
                    {
                      RA.isNotEmpty(uploadedDatasets) &&
                      <Label>
                        <Icon name='upload' />
                        {'Uploaded Datasets'}
                        <Label.Detail content={R.length(uploadedDatasets)} />
                      </Label>
                    }
                  </Label.Group>
                  <Divider horizontal content='Datasets' />
                  <Label.Group size='tiny'>
                  {
                    R.map(
                      ({datasetID, name, cancerTag, oncotreeCode}) => (
                        <Label key={datasetID}>
                          {name}
                          {RA.isNotNil(cancerTag) && <Label.Detail content={cancerTag ? 'Cancer' : 'Non-cancer'} />}
                          {RA.isNotNil(oncotreeCode) && <Label.Detail content={oncotreeCode} />}
                        </Label>
                      ),
                      allDatasets
                    )
                  }
                  </Label.Group>
                </Segment>
              </Segment.Group>
              </>
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
        {
          R.ifElse(
            R.isEmpty,
            R_.alwaysNull,
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
}


export default ProjectCard