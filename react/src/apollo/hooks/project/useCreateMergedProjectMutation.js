import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { useDispatch } from 'react-redux'
import { useActor } from '@xstate/react'
import * as RA from 'ramda-adjunct'

import { useCrescentContext, useMachineServices } from '../../../redux/hooks'
import {setProject} from '../../../redux/actions/context'

const useCreateMergedProjectMutation = () => {
  const dispatch = useDispatch()
  const { userID } = useCrescentContext()
  const { newProjectService } = useMachineServices()
  
  const [{ context: { projectDescription, projectName, mergedProjectIDs, uploadedDatasetIDs } }] = useActor(newProjectService)
  
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
    onCompleted: ({ createMergedProject: project }) => {
      if (RA.isNotNil(project)) {
        const { projectID } = project

        dispatch(setProject({ projectID }))
      }
    }
  })

  return createMergedProject
}

export default useCreateMergedProjectMutation