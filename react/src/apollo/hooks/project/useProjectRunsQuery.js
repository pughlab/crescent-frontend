import {useState} from 'react'
import {useLazyQuery, useQuery} from '@apollo/react-hooks'
import {gql} from 'apollo-boost'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

export default function useProjectRunsQuery(projectID) {
  const [projectRuns, setProjectRuns] = useState([])

  useQuery(gql`
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

  const [getUpdatedRun] = useLazyQuery(gql`
    query UpdatedRun($runID: ID) {
      run(runID: $runID) {
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
    onCompleted: ({run}) => {
      if (RA.isNotNil(run)) {
        setProjectRuns(currProjectRuns => {
          const runIndex = R.findIndex(R.propEq('runID', run.runID))(projectRuns)
  
          return runIndex !== -1 ? [...currProjectRuns.slice(0, runIndex), run, ...currProjectRuns.slice(runIndex + 1)] : currProjectRuns
        })
      }
    }
  })

  const removeRun = runID => {
    const runIndex = R.findIndex(R.propEq('runID', runID))(projectRuns)

    setProjectRuns(currProjectRuns => R.remove(runIndex, 1, currProjectRuns))
  }

  return {getUpdatedRun, projectRuns, removeRun}
}
