import React, { useState } from 'react'
import { Button, Header, Icon, Modal } from 'semantic-ui-react'
import { useActor } from '@xstate/react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import { useNewProjectEvents, useNewProjectMachine } from '../../../../xstate/hooks'
import { useCrescentContext, useMachineServices } from '../../../../redux/hooks'
import DirectoryUploadSegment from '../../projectsPage/NewProjectModal/DirectoryUploadSegment'
import { useAddDatasetToProjectMutation } from '../../../../apollo/hooks/project'

const AddDatasetModalComponent = ({ refetchProject }) => {
  const [open, setOpen] = useState(false)
  const { projectID } = useCrescentContext()
  const { newProjectService } = useMachineServices()
  const [{ context: { uploadedDatasetIDs } }] = useActor(newProjectService)
  const { resetProject } = useNewProjectEvents()
  const { addDatasetToProject, addDatasetToProjectError, addDatasetToProjectLoading } = useAddDatasetToProjectMutation()

  return (
    <Modal
      closeIcon
      closeOnDimmerClick={false}
      onClose={() => {
        setOpen(false)
        resetProject()
      }}
      open={open}
      size="large"
      trigger={
        <Button
          icon
          labelPosition="left"
          onClick={() => setOpen(true)}
          style={{
            display: 'block',
            margin: '0 auto'
          }}
        >
          <Icon name="upload" />
          Upload Additional Datasets
        </Button>
      }
    >
      <Modal.Header>
        <Header
          content="Upload Additional Datasets"
          subheader="Add additional datasets to your existing project"
          textAlign="center"
        />
      </Modal.Header>
      <Modal.Content scrolling>
        <DirectoryUploadSegment />
      </Modal.Content>
      <Modal.Actions>
        <Button
          content={
            addDatasetToProjectLoading ? `Adding Dataset${RA.lengthGt(1, uploadedDatasetIDs) ? 's' : ''} to Project` :
            RA.isNotNil(addDatasetToProjectError) ? `Unable to Add Dataset${RA.lengthGt(1, uploadedDatasetIDs) ? 's' : ''} to Project, Please Try Again...` :
            `Add Dataset${RA.lengthGt(1, uploadedDatasetIDs) ? 's' : ''} to Project`
          }
          disabled={
            RA.isEmptyArray(uploadedDatasetIDs) || // The user hasn't uploaded any datasets yet
            addDatasetToProjectLoading // The dataset(s) are currently being added to the project
          }
          onClick={async () => {
            try {
              await addDatasetToProject({
                variables: {
                  datasetIDs: uploadedDatasetIDs,
                  projectID
                }
              })

              setOpen(false)
              resetProject()
              refetchProject()
            } catch {
              console.log(`Unable to add dataset ${uploadedDatasetIDs.join(", ")} to project`)
            }
          }}
        />
      </Modal.Actions>
    </Modal>
  )
}

const AddDatasetModal = ({ refetchProject }) => {
  useNewProjectMachine()
  const {newProjectService} = useMachineServices()

  if (R.isNil(newProjectService)) return null

  return (
    <AddDatasetModalComponent {...{refetchProject}} />
  )
}

export default AddDatasetModal