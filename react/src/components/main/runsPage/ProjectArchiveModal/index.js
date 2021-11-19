import React from 'react'
import {Button, Divider, Header, Icon, Modal} from 'semantic-ui-react'
import * as RA from 'ramda-adjunct'
import {useDispatch} from 'react-redux'
import {resetProjectArchive, setProjectArchiveModalOpen} from '../../../../redux/actions/projectArchive'
import {useProjectArchive} from '../../../../redux/hooks'
import {ConfirmArchiveProjectModal, ConfirmArchiveRunsModal} from './ConfirmModal'
import ProjectRuns from './ProjectRuns'

const ProjectArchiveModal = ({ archiveProject, archiveRuns, project, projectRuns: allProjectRuns, removeRuns }) => {
  const dispatch = useDispatch()
  const {projectArchiveModalOpen} = useProjectArchive()

  const {
    createdOn,
    description: projectDescription,
    name: projectName,
    archived
  } = project

  return (
    <Modal
      onOpen={() => dispatch(setProjectArchiveModalOpen({open: true}))}
      onClose={() => dispatch(resetProjectArchive())}
      open={projectArchiveModalOpen}
      trigger={
        <Button
          animated="vertical"
          color="red"
          disabled={RA.isNotNil(archived)}
        >
          <Button.Content visible>
            <Icon name="trash"/>
          </Button.Content>
          <Button.Content hidden content="Delete Project or Runs"/>
        </Button>
      }
    >
      <Modal.Header>
        <Header
          content={projectName}
          icon="trash"
          size="tiny"
          subheader="Delete project or runs?"
        />
      </Modal.Header>
      <Modal.Content scrolling>
        <Header content="Delete Project" />
        <ConfirmArchiveProjectModal {...{allProjectRuns, archiveProject, createdOn, projectDescription, projectName}} />
        <br />
        <Divider horizontal content="Or" />
        <Header content="Select Runs to Delete" />
        <ProjectRuns {...{allProjectRuns}} />
        <br />
        <ConfirmArchiveRunsModal {...{allProjectRuns, archiveRuns, projectName, removeRuns}} />
      </Modal.Content>
    </Modal>
  )
}

export default ProjectArchiveModal