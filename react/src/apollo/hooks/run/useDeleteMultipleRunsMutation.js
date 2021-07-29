import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { gql } from 'apollo-boost'

export default function useDeleteMultipleRunsMutation({ projectID }) {
    const [project, setProject] = useState(null)
    const { data: dataDetails, refetch } = useQuery(gql`
    query ProjectRuns($projectID: ID) {
        project(projectID: $projectID) {
            projectID
            name
            kind
            description
            accession
            externalUrls {
              label
              link
              type
            }
            createdOn
            createdBy {
              name
              userID
            }
            
            runs {
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
      }
      `, {
        fetchPolicy: 'network-only',
        variables: { projectID }
    })

    const [deleteMultipleRuns, { loading, data: dataRuns, error }] = useMutation(gql`
    mutation DeleteMultipleRuns($runIDs: [ID]) {
        deleteMultipleRuns(runIDs: $runIDs)
    }
  `, {
        onCompleted: (data) => {
            if (!!data.deleteMultipleRuns) {
                refetch()
            }
        }
    })

    useEffect(() => {
        if (!!dataDetails) {
            setProject(dataDetails.project)
        }
    }, [dataDetails])


    return { project, deleteMultipleRuns, loading, dataRuns }
}