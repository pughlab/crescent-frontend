


import React, {useState, useCallback, useEffect} from 'react';

import { useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import moment from 'moment'

import {queryIsNotNil} from '../../../../utils'

import {useDropzone} from 'react-dropzone'

import {Form, Card, Header, Message, Button, Segment, Modal, Label, Divider, Icon, Image, Popup, Grid, Step} from 'semantic-ui-react'


import {useCrescentContext} from '../../../../redux/hooks'

const CreateProjectButton = ({
  newProjectState, newProjectDispatch,

  refetch
}) => {
  const {
    name, description, mergedProjectIDs, uploadedDatasetIDs,
    oncotreeReference, cancerTag
  } = newProjectState
  const {userID} = useCrescentContext()
  // GQL mutation to create a project
  const [createMergedProject, {loading, data, error}] = useMutation(gql`
    mutation CreateMergedProject(
      $userID: ID!,
      $name: String!,
      $description: String!,
      $projectIDs: [ID]!,
      $datasetIDs: [ID]!,
      $oncotreeReference: OncotreeCode!,
      $cancerTag: Boolean
    ) {
      createMergedProject(
        userID: $userID,
        name: $name,
        description: $description,
        projectIDs: $projectIDs,
        datasetIDs: $datasetIDs,
        oncotreeReference: $oncotreeReference,
        cancerTag: $cancerTag,
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
      projectIDs: mergedProjectIDs,
      datasetIDs: uploadedDatasetIDs,
      oncotreeReference, cancerTag
    },
    onCompleted: ({createMergedProject: newProject}) => {
      if (RA.isNotNil(newProject)) {
        // Should call refetch before setting to new project
        refetch()
        // setProject(newProject)
      }
    }
  })


  const noDetails = R.any(R.isEmpty, [name, description])
  const noMergedProjects = R.isEmpty(mergedProjectIDs)
  const noUploadedDatasets = R.isEmpty(uploadedDatasetIDs)
  const disabled = R.any(RA.isTrue, [
    loading,
    noDetails,
    R.and(noMergedProjects, noUploadedDatasets)
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
        noMergedProjects ?
          'You did not select any projects to merge'
        :
          `${R.length(mergedProjectIDs)} Project${R.equals(1, R.length(mergedProjectIDs)) ? '' : 's'} Selected ${R.equals(1, R.length(mergedProjectIDs)) ? '' : 'To Merge'}`
      }
      </Message>

      <Message>
      {
        noUploadedDatasets ?
          'You did not upload any single-cell sample datasets'
        :
          `${R.length(uploadedDatasetIDs)} Uploaded Dataset${R.equals(1, R.length(uploadedDatasetIDs)) ? '' : 's'}`
      }
      </Message>

      <Button size='huge' fluid
        disabled={disabled}
        onClick={() => createMergedProject()}
        content='Create Project'
      />
    </Segment>
  )
}

export default CreateProjectButton