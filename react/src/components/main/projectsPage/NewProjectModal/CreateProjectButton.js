import React from 'react'

import { useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import { CREATE_MERGED_PROJECT } from '../../../../apollo/queries/project'
import {Form, Card, Header, Message, Button, Segment, Modal, Label, Divider, Icon, Image, Popup, Grid, Step} from 'semantic-ui-react'


import {useDispatch} from 'react-redux'
import {useCrescentContext} from '../../../../redux/hooks'
import {setProject} from '../../../../redux/actions/context'

const CreateProjectButton = ({
  newProjectState, newProjectDispatch,
}) => {
  const {
    name, description, mergedProjectIDs, uploadedDatasetIDs,
    oncotreeReference, cancerTag
  } = newProjectState

  const dispatch = useDispatch()
  const {userID} = useCrescentContext()
  // GQL mutation to create a project
  const [createMergedProject, {loading, data, error}] = useMutation(CREATE_MERGED_PROJECT, {
    variables: {
      userID, name, description,
      projectIDs: mergedProjectIDs,
      datasetIDs: uploadedDatasetIDs,
    },
    onCompleted: ({createMergedProject: project}) => {
      if (RA.isNotNil(project)) {
        const {projectID} = project
        dispatch(setProject({projectID}))
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
          'You did not select any public or prior projects to integrate'
        :
          `${R.length(mergedProjectIDs)} Project${R.equals(1, R.length(mergedProjectIDs)) ? '' : 's'} selected ${R.equals(1, R.length(mergedProjectIDs)) ? '' : 'to integrate'}`
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
        color={disabled ? undefined : 'black'}
        onClick={() => createMergedProject()}
        content='Create Project'
      />
    </Segment>
  )
}

export default CreateProjectButton