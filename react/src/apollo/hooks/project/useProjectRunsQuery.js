import {useState} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'


export default function useProjectRunsQuery(projectID) {
  const [projectRuns, setProjectRuns] = useState([])
  const {loading, data, error} = useQuery(gql`
    query ProjectRuns($projectID: ID) {
      runs(projectID: $projectID) {
        runID
        createdOn
        createdBy {
          userID
          name
        }
        name
        description
        parameters
        
        status
        hasResults

        submittedOn
        completedOn

        datasets {
          datasetID
          name
          size
          hasMetadata
          cancerTag
        }
      }
    }
  `, {
    fetchPolicy: 'network-only',
    variables: {projectID},
    onCompleted: ({runs}) => {
      setProjectRuns(runs)
    }
  })

  return projectRuns
}
