import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { gql } from 'apollo-boost'

export default function useDeleteMultipleRunsMutation({ projectID }) {
    const [projectRuns, setProjectRuns] = useState(null)
    const { data: dataDetails, refetch } = useQuery(gql`
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
        variables: { projectID }
    })

    const [deleteMultipleRuns, { loading, data: dataRuns, error }] = useMutation(gql`
    mutation DeleteMultipleRuns($runIDs: [ID]) {
        deleteMultipleRuns(runIDs: $runIDs) {
            name
      }
    }
  `)
    useEffect(() => {
        if (dataRuns) {
            refetch()
        }
    }, [dataRuns])

    useEffect(() => {
        if (dataDetails) {
          setProjectRuns(dataDetails.projectRuns)
        }
      }, [dataDetails])


    return { projectRuns, deleteMultipleRuns, loading, dataRuns }
}