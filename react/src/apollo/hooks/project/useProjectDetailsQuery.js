import {useState} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { PROJECT_DETAILS } from '../../queries/project'

export default function useProjectDetailsQuery(projectID) {
  const [project, setProject] = useState(null)
  const {loading, data, error} = useQuery(PROJECT_DETAILS, {
    fetchPolicy: 'cache-and-network',
    variables: {projectID},
    onCompleted: ({project}) => {
      setProject(project)
    }
  })

  return project
}
