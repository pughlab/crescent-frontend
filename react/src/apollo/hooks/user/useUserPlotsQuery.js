import {useState, useEffect} from 'react';

import * as RA from 'ramda-adjunct'

import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

export default function useUserPlotsQuery(userID) {
  const [projects, setProjects] = useState(null)

  const {loading, data, error} = useQuery(gql`
    query UserProjects($userID: ID) {
      projects(userID: $userID) {
        projectID
        name
        createdOn
        createdBy {
          name
        }
        allDatasets {
          datasetID
          name
        }
        runs {
          name
          runID
          createdOn
          createdBy {
            name
          }
          savedPlotQueries {
            id
            activeResult
            selectedQC
            selectedFeature
            selectedFeatures
            selectedGroup
            selectedAssay
            selectedDiffExpression
            selectedQCDataset
            selectedScaleBy
            selectedExpRange
          }
        }
      }
    }
  `, {
    fetchPolicy: 'network-only',
    variables: {userID},
    onCompleted: ({projects}) => {
      if (RA.isNotNil(projects)) {
        setProjects(projects)
      }
    }
  })

  return projects
}