import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { useDispatch } from 'react-redux'
import * as RA from 'ramda-adjunct'
import {setProject} from '../../../redux/actions/context'

const useCreateMergedProjectMutation = () => {
  const dispatch = useDispatch()
  
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