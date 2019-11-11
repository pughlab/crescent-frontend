import React, {useState, useEffect} from 'react';

import {Container, Card, Divider, Button, Header, Icon, Modal, Dropdown, Label, Segment, Grid} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import withRedux from '../../../redux/hoc'

import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {queryIsNotNil} from '../../../utils'

const ShareProjectModal = withRedux(({
  app: {
    user: {
      userID
    },
    project: {
      projectID,
      name: projectName
    },
  },
}) => {
  // State variable to keep track of who to add
  const [newSharedWith, setNewSharedWith] = useState([])

  // Project users
  const {loading: loadingProjectUsers, data: dataProjectUsers, error: errorProjectUsers, refetch: refetchProjectUsers} = useQuery(gql`
    query ProjectUsers($projectID: ID) {
      project(projectID: $projectID) {
        createdBy {
          userID
          name
        }
        sharedWith {
          userID
          name
        }
      }
    }`, {
    fetchPolicy: 'network-only',
      variables: {projectID}
    })
  const creator = R.ifElse(
    queryIsNotNil('project'),
    R.path(['project', 'createdBy']),
    R.always(null)
  )(dataProjectUsers)
  const sharedWith = R.ifElse(
    queryIsNotNil('project'),
    R.path(['project', 'sharedWith']),
    R.always([])
  )(dataProjectUsers)

  // All users to search throughR.compose()
  const notCurrentUser = R.compose(R.not, R.propEq('userID', userID))
  const notInProject = R.compose(R.or(loadingProjectUsers), R.not, R.includes(R.__, sharedWith))
  const notProjectCreator = loadingProjectUsers ? R.always(false) : R.compose(R.not, R.propEq('userID', R.prop('userID', creator)))
  const {loading: loadingUsers, data: dataUsers, error: errorUsers, refetchUsers} = useQuery(gql`
    query AllUsers {
      users {
        userID
        name
      }
    }`, {
      fetchPolicy: 'network-only'
    })
  const possibleUsersToAdd = R.ifElse(
    queryIsNotNil('users'),
    R.compose(
      R.map(
        ({userID, name}) => ({
          value: userID,
          text: name,
          content: name
        })
      ),
      R.filter(R.allPass([notInProject, notCurrentUser, notProjectCreator,])),
      R.prop('users')
    ),
    R.always([])
  )(dataUsers)

  // Mutation to set new sharedWith members
  const [shareProject, {loadingShareProject}] = useMutation(gql`
    mutation ShareProject($projectID: ID, $sharedWith: [ID]) {
      shareProject(projectID: $projectID, sharedWith: $sharedWith) {
        projectID
      }
    }
  `, {
    variables: {projectID},
    onCompleted: data => {
      setNewSharedWith([])
      refetchProjectUsers()
    }
  })

  return (
    <Modal basic size='small'
      trigger={
        <Button color='twitter' >
          <Icon name='add user' />
          Share Project
        </Button>
      }
    >
      <Modal.Content>
        <Segment attached='top'>
          <Header icon='add user' content={projectName} subheader='Share this project with other users?' />
        </Segment>
        <Segment attached='bottom' loading={R.or(loadingProjectUsers, loadingShareProject)}>
          {/* <Divider content='Created by' horizontal />
          {
            RA.isNotNil(creator) &&
            <Label size='large' color='green' content={R.prop('name', creator)} />
          }
           */}
          <Grid>
            <Grid.Column width={16}>
            <Divider content='Shared with' horizontal />
            {
              RA.isNotEmpty(sharedWith) &&
              <Label.Group size='large'>
              {
                R.addIndex(R.map)(
                  ({userID, name}, index) => (
                    <Label key={index}
                      basic
                      color='green'
                      content={name}
                      onRemove={
                        () => shareProject({
                          variables: {
                            sharedWith: R.compose(
                              R.reject(R.equals(userID)),
                              R.pluck('userID')
                            )(sharedWith)
                          }
                        })
                      }
                    />
                  ),
                  sharedWith
                )
              }
              </Label.Group>
            }
            </Grid.Column>
            <Grid.Column width={12}>
              <Dropdown multiple selection fluid search options={possibleUsersToAdd} loading={loadingUsers}
                placeholder='Search users to share project with'
                onChange={(event, {value}) => setNewSharedWith(value)}
              />
            </Grid.Column>
            <Grid.Column width={4}>
              <Button fluid color='green' inverted icon='plus'
                disabled={R.or(loadingProjectUsers, loadingUsers)}
                onClick={() => shareProject({
                    variables: {
                      sharedWith: R.compose(
                          R.concat(newSharedWith),
                          R.pluck('userID')
                        )(sharedWith)
                    }
                  })
                }
              />
            </Grid.Column>
          </Grid>
        </Segment>
      </Modal.Content>
    </Modal>
  )
})

export default ShareProjectModal