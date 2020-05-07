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
    variables: {projectID},
    onCompleted: ({project}) => {
      console.log('project', project)
      setProject(project)
    }
  })

  return project
}
