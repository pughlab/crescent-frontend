import {useActor} from '@xstate/react'
import * as R from 'ramda'
import {Button, Header, Message, Segment} from 'semantic-ui-react'
import {useCrescentContext, useMachineServices} from '../../../../redux/hooks'
import {useNewProjectEvents} from '../../../../xstate/hooks'

const CreateProjectButton = () => {
  const {userID} = useCrescentContext()
  const {newProjectService} = useMachineServices()
  const [{context: {projectDescription, projectName, mergedProjectIDs, uploadedDatasetIDs}, matches}] = useActor(newProjectService)
  const {createProject} = useNewProjectEvents()

  const noProjectName = R.isEmpty(projectName)
  const noProjectDescription = R.isEmpty(projectDescription)
  const noMergedProjects = R.isEmpty(mergedProjectIDs)
  const noUploadedDatasets = R.isEmpty(uploadedDatasetIDs)
  const disabled = R.none(matches, ['projectCreationReady', 'projectCreationFailed'])

  return (
    <Segment basic>
      <Message>
        { R.or(noProjectName, noProjectDescription) ? (
          `You did not enter a ${
            R.and(noProjectName, noProjectDescription) ? 'project name or description' :
            noProjectName ? 'project name' :
            'project description'
          }`
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
        content={
          matches('projectCreationPending') ? 'Creating Project' : // The project is currently being created
          matches('projectCreationFailed') ? 'Unable to Create Project, Please Try Again' : // The project creation has failed
          'Create Project' // The project is ready to be created
        }
        disabled={disabled}
        onClick={() => createProject({ userID })}
        size="huge"
      />
    </Segment>
  )
}

export default CreateProjectButton