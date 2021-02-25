import React, {useState, useEffect} from 'react';

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import * as R_ from 'ramda-extension'
import moment from 'moment'
import {PulseLoader} from 'react-spinners'


import filesize from 'filesize'

import {Form, Card, Header, Transition, Button, Container, Segment, Modal, Label, Divider, Icon, Image, Popup, Message} from 'semantic-ui-react'

import Marquee from 'react-marquee'

import {useDispatch} from 'react-redux'
import {setProject} from '../../../redux/actions/context'
import {useProjectDetailsQuery} from '../../../apollo/hooks/project'

const ProjectCard = ({
  // Prop
  projectID
}) => {
  const dispatch = useDispatch()
  const project = useProjectDetailsQuery(projectID)

  if (R.isNil(project)) {
    // return null
    return (
      <Card color='grey'>
         <Header textAlign='center' icon>
          <PulseLoader size='8'/>
         </Header>
      </Card>
      )
  }

  const {
    name,
    description,
    accession,
    createdBy: {name: creatorName},
    createdOn,

    runs, // {runID, name, status}

    mergedProjects,
    uploadedDatasets,

    allDatasets
  } = project

  const uniqueOncotreeCodesArray = R.compose(R.uniq, R.reject(R.isNil), R.pluck('oncotreeCode'))(allDatasets)

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
                <Message size='mini'>
                  <Message.Content>
                    <Divider horizontal content='Details' />
                    {description}
                  </Message.Content>
                </Message>
                
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
                        {'Integrated Projects'}
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
                      ({datasetID, name, cancerTag, oncotreeCode, hasMetadata}) => (
                        <Label key={datasetID}>
                          {name}
                          {RA.isNotNil(cancerTag) && <Label.Detail content={cancerTag ? 'CANCER' : 'NON-CANCER'} />}
                          {RA.isNotNil(oncotreeCode) && <Label.Detail content={oncotreeCode} />}
                          {/* <Label.Detail content={hasMetadata ? 'HAS METADATA' : 'NO METADATA'} /> */}
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
              <Marquee text={name} />
            </Header>
            <Label.Group>
              {
                RA.isNotNil(accession) &&
                <Label content={<Icon style={{margin: 0}} name='info circle' />}  detail={accession} />
              }
              <Label content={<Icon style={{margin: 0}} name='user' />}  detail={creatorName} />
              <Label content={<Icon style={{margin: 0}} name='calendar alternate outline' />} detail={`${moment(createdOn).format('D MMMM YYYY')}`} />
            </Label.Group>
            <Label.Group>
              <Label content={<Icon style={{margin: 0}} name='upload' />} detail={`${R.length(allDatasets)} dataset(s)`} />
              {
                R.map(
                  oncotreeCode => <Label key={oncotreeCode} content={<Icon style={{margin: 0}} name='paperclip' />} detail={oncotreeCode} />,
                  uniqueOncotreeCodesArray
                 )
              }
            </Label.Group>
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