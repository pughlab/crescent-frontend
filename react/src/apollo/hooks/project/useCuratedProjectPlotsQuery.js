import {useState} from 'react';

import * as RA from 'ramda-adjunct'

import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

export default function useCuratedProjectPlotsQuery() {
  const [curatedProjects, setCuratedProjects] = useState(null)

  const {loading, data, error} = useQuery(gql`
    query {
      curatedProjects {
        projectID
        name
        createdOn
        createdBy {
          name
          userID
        }
        allDatasets {
          datasetID
          name
          size
          cancerTag
          numCells
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
    fetchPolicy: 'cache-and-network',
    onCompleted: ({curatedProjects}) => {
      if (RA.isNotNil(curatedProjects)) {
        setCuratedProjects(curatedProjects)
      }
    }
  })

  return curatedProjects
}