import {useState, useEffect} from 'react';

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

export default function useUserProjectsQuery(userID) {
  const [userProjects, setUserProjects] = useState(null)

  const {loading, data, error} = useQuery(gql`
    query UserProjects($userID: ID) {
      projects(userID: $userID) {
        projectID
        name
        kind
        description
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
          name
          status
        }

        mergedProjects {
          projectID
          name
        }
        uploadedDatasets {
          datasetID
          name
          size
        }

        datasetSize

        cancerTag
        oncotreeTissue {
          name
          code
        }
      }
    }
  `, {
    fetchPolicy: 'network-only',
    variables: {userID},
    onCompleted: ({projects}) => {
      if (RA.isNotNil(projects)) {
        setUserProjects(projects)
      }
    }
  })


  return userProjects
}