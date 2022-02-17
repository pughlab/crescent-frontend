import {useActor} from '@xstate/react'
import {Form} from 'semantic-ui-react'
import {useMachineServices} from '../../../../redux/hooks'
import {useNewProjectEvents} from '../../../../xstate/hooks'

const DetailsForm = () => {
  const {newProjectService} = useMachineServices()
  const [{context: {projectDescription, projectName}}] = useActor(newProjectService)
  const {updateProjectDescription, updateProjectName} = useNewProjectEvents()

  return (
    <Form>
      <Form.Input
        fluid
        onChange={(_, {value}) => updateProjectName({ projectName: value })}
        placeholder="Enter a project name"
        value={projectName}
      />
      <Form.TextArea
        onChange={(_, {value}) => updateProjectDescription({ projectDescription: value })}
        placeholder="Enter a short project description"
        value={projectDescription}
      />
    </Form>
  )
}

export default DetailsForm