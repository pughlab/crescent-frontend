


import React, {useState, useCallback, useEffect} from 'react';

import { useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import moment from 'moment'

import {queryIsNotNil} from '../../../../utils'

import {useDropzone} from 'react-dropzone'

import {Form, Card, Header, Message, Button, Segment, Modal, Label, Divider, Icon, Image, Popup, Grid, Step} from 'semantic-ui-react'

import withRedux from '../../../../redux/hoc'


const CreateProjectButton = withRedux(({
  app: {user: {userID}},
  actions: {
    setProject
  },

  name, setName,
  description, setDescription,
  datasetDirectories, setDatasetDirectories,
  existingDatasets, setExistingDatasets,

  refetch
}) => {
  console.log(datasetDirectories)
  // GQL mutation to create a project
  const [createMergedProject, {loading, data, error}] = useMutation(gql`
    mutation CreateMergedProject(
      $userID: ID!,
      $name: String!,
      $description: String!,
      $projectIDs: [ID]!,
      $datasets: [DatasetDirectory]
    ) {
      createMergedProject(
        userID: $userID,
        name: $name,
        description: $description,
        projectIDs: $projectIDs,
        datasets: $datasets
      ) {
        projectID
        name
        kind
        description
        createdOn
        createdBy {
          name
          userID
        }
        
        runs {
          runID
          name
          status
        }

        mergedProjects {
          name
          projectID
        }

        datasetSize
      }
    }
  `, {
    variables: {
      userID, name, description,
      projectIDs: existingDatasets,
      datasets: datasetDirectories
    },
    onCompleted: ({createMergedProject: newProject}) => {
      if (RA.isNotNil(newProject)) {
        // Should call refetch before setting to new project
        refetch()
        setProject(newProject)
      }
    }
  })


  const noDetails = R.any(R.isEmpty, [name, description])
  const noExistingDatasets = R.isEmpty(existingDatasets)
  const noUploadedDatasets = R.isEmpty(datasetDirectories)
  const disabled = R.any(RA.isTrue, [
    loading,
    noDetails,
    R.and(noExistingDatasets, noUploadedDatasets)
  ])
  return (
    <Segment basic>
      <Message>
      {
        noDetails ?
          'You need to enter in the project name and description'
        :
          <Header>
            {name}
            <Header.Subheader>
              {description}
            </Header.Subheader>
          </Header>
      }
      </Message>

      <Message>
      {
        noExistingDatasets ?
          'You did not select any projects to merge'
        :
          `${R.length(existingDatasets)} Project${R.equals(1, R.length(existingDatasets)) ? '' : 's'} Selected ${R.equals(1, R.length(existingDatasets)) ? '' : 'To Merge'}`
      }
      </Message>

      <Message>
      {
        noUploadedDatasets ?
          'You did not upload any single-cell sample datasets'
        :
          `${R.length(datasetDirectories)} Uploaded Dataset${R.equals(1, R.length(datasetDirectories)) ? '' : 's'}`
      }
      </Message>

      <Button size='huge' fluid
        disabled={disabled}
        onClick={() => createMergedProject()}
        content='Create Project'
      />
    </Segment>
  )
})

export default CreateProjectButton