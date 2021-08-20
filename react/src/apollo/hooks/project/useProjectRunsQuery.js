import {useState} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { PROJECT_RUNS } from '../../queries/project'


export default function useProjectRunsQuery(projectID) {
  const [projectRuns, setProjectRuns] = useState([])
  const {loading, data, error} = useQuery(PROJECT_RUNS, {
    fetchPolicy: 'network-only',
    variables: {projectID},
    onCompleted: ({runs}) => {
      setProjectRuns(runs)
    }
  })

  return projectRuns
}
