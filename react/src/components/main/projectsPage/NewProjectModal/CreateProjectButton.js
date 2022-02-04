import React from 'react'
import {useActor} from '@xstate/react'
import {useMutation} from '@apollo/react-hooks'
import {gql} from 'apollo-boost'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import {Button, Header, Message, Segment} from 'semantic-ui-react'
import {useDispatch} from 'react-redux'
import {useCrescentContext, useMachineServices} from '../../../../redux/hooks'
import {setProject} from '../../../../redux/actions/context'

const CreateProjectButton = () => {
  const {newProjectService} = useMachineServices()
  const [{context: {projectDescription, projectName, mergedProjectIDs, uploadedDatasetIDs}, matches}] = useActor(newProjectService)

  const dispatch = useDispatch()
  const {userID} = useCrescentContext()

  // GQL mutation to create a project
  const [createMergedProject] = useMutation(gql`
    mutation CreateMergedProject(
      $userID: ID!,
      $name: String!,
      $description: String!,
      $projectIDs: [ID]!,
      $datasetIDs: [ID]!,
    ) {
      createMergedProject(
        userID: $userID,
        name: $name,
        description: $description,
        projectIDs: $projectIDs,
        datasetIDs: $datasetIDs,
      ) {
        projectID
      }
    }
  `, {
    variables: {
      userID,
      name: projectName,
      description: projectDescription,
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

  const noDetails = R.any(R.isEmpty, [projectDescription, projectName])
  const noMergedProjects = R.isEmpty(mergedProjectIDs)
  const noUploadedDatasets = R.isEmpty(uploadedDatasetIDs)
  const disabled = R.not(matches('projectCreationReady'))

  return (
    <Segment basic>
      <Message>
        { noDetails ? (
          'You need to enter in the project name and description'
        ) : (
          <Header>
            {projectName}
            <Header.Subheader>
              {projectDescription}
            </Header.Subheader>
          </Header>
        )}
      </Message>
      <Message>
        { noMergedProjects ? (
          'You did not select any public or prior projects to integrate'
        ) : (
          `${R.length(mergedProjectIDs)} Project${R.equals(1, R.length(mergedProjectIDs)) ? '' : 's'} selected ${R.equals(1, R.length(mergedProjectIDs)) ? '' : 'to integrate'}`
        )}
      </Message>
      <Message>
        { noUploadedDatasets ? (
          'You did not upload any single-cell sample datasets'
        ) : (
          `${R.length(uploadedDatasetIDs)} Uploaded Dataset${R.equals(1, R.length(uploadedDatasetIDs)) ? '' : 's'}`
        )}
      </Message>
      <Button
        fluid
        color={disabled ? undefined : 'black'}
        content="Create Project"
        disabled={disabled}
        onClick={() => createMergedProject()}
        size="huge"
      />
    </Segment>
  )
}

export default CreateProjectButton