import React, { useState } from 'react'
import { Button, Header, Icon, Modal } from 'semantic-ui-react'
import { useActor } from '@xstate/react'
import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import { useNewProjectEvents, useNewProjectMachine } from '../../../../xstate/hooks'
import { useCrescentContext, useMachineServices } from '../../../../redux/hooks'
import DirectoryUploadSegment from '../../projectsPage/NewProjectModal/DirectoryUploadSegment'

const AddDatasetModalComponent = ({ refetchProject }) => {
  const [open, setOpen] = useState(false)
  const { projectID } = useCrescentContext()
  const { newProjectService } = useMachineServices()
  const [{ context: { uploadedDatasetIDs } }] = useActor(newProjectService)
  const { resetProject } = useNewProjectEvents()
  
  // GQL mutation to create a dataset
  const [addDatasetToProject] = useMutation(gql`
    mutation AddDataset(
      $datasetIDs: [ID!]!
      $projectID: ID!
    ) {
      addDataset(
        datasetIDs: $datasetIDs
        projectID: $projectID
      ) {
        projectID
      }
    }
  `, {
    onCompleted: () => {
      setOpen(false)
      resetProject()
      refetchProject()
    }
  })

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
          content="Add Datasets to Project"
          disabled={RA.isEmptyArray(uploadedDatasetIDs)}
          onClick={() => {
            addDatasetToProject({
              variables: {
                datasetIDs: uploadedDatasetIDs,
                projectID
              }
            })
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