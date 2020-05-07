import {useState} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

export default function useRunDetails(runID) {
  const [run, setRun] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query RunDetails($runID: ID) {
      run(runID: $runID) {
        runID
        createdOn
        createdBy {
          userID
          name
        }
        name
        params
        status

        submittedOn
        completedOn

        datasets {
          datasetID
          name
          size
          hasMetadata
        }

        project {
          name
          createdBy {
            userID
            name
          }
        }
      }
    }
  `, {
    fetchPolicy: 'cache-and-network',
    variables: {runID},
    onCompleted: ({run}) => {
      setRun(run)
    }
  })

  return run
}
