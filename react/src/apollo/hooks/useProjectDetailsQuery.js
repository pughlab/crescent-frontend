import {useState} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

export default function useProjectDetailsQuery(projectID) {
  const [project, setProject] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query ProjectDetails($projectID: ID) {
      project(projectID: $projectID) {
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

        allDatasets {
          datasetID
          name
          size
          cancerTag
          oncotreeCode
        }
      }
    }
  `, {
    fetchPolicy: 'cache-and-network',
    variables: {projectID},
    onCompleted: ({project}) => {
      setProject(project)
    }
  })

  return project
}
