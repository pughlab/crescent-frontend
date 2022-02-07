import React from 'react'
import {useActor} from '@xstate/react'
import * as R from 'ramda'
import {Button, Header, Message, Segment} from 'semantic-ui-react'
import {useMachineServices} from '../../../../redux/hooks'
import {useCreateMergedProjectMutation} from '../../../../apollo/hooks/project'

const CreateProjectButton = () => {
  const {newProjectService} = useMachineServices()
  const [{context: {projectDescription, projectName, mergedProjectIDs, uploadedDatasetIDs}, matches}] = useActor(newProjectService)

  const createMergedProject = useCreateMergedProjectMutation()

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