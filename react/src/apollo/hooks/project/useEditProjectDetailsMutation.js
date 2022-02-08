import {useState, useEffect} from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'

import * as R from 'ramda'

import { gql } from 'apollo-boost'

// custom hook to edit project details
export default function useEditProjectDetailsMutation({projectID}) {
  const [project, setProject] = useState(null)
  const {data: dataDetails, refetch} = useQuery(gql`
  query ProjectDetails($projectID: ID) {
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
      sharedWith {
        name
        userID
      }
      runs {
        runID
        name
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
        hasMetadata
        cancerTag
        oncotreeCode
        customTags
      }

      archived
    }
  }
  `, {
    fetchPolicy: 'network-only',
    variables: {projectID},
  })

  // using the useMutation hook to get a mutate function (editProjectDescription) that we can call to execute the mutation
  const [editProjectDescription, {loading: loadingDesc, data: dataDesc, error: errorDesc}] = useMutation(gql`
    mutation UpdateProjectDescription($projectID: ID, $newDescription: String) {
      updateProjectDescription(projectID: $projectID, newDescription: $newDescription) {
        description
      }
    }
  `, {
    variables: {projectID}
  })
  useEffect(() => {
    if (dataDesc) {
      refetch()
    }
  }, [dataDesc])

  const [editProjectName, {loading: loadingName, data: dataName, error: errorName}] = useMutation(gql`
  mutation UpdateProjectName($projectID: ID, $newName: String) {
    updateProjectName(projectID: $projectID, newName: $newName) {
      name
    }
  }
  `, {
    variables: {projectID}
  })
  useEffect(() => {
    if (dataName) {
      refetch()
    }
  }, [dataName])

  const [changeProjectOwnership, {loading: loadingOwner, data: dataOwner, error: errorOwner}] = useMutation(gql`
    mutation ChangeProjectOwnership($projectID: ID, $oldOwnerID: ID, $newOwnerID: ID) {
      changeProjectOwnership(projectID: $projectID, oldOwnerID: $oldOwnerID, newOwnerID: $newOwnerID) {
        createdBy {
          name
        }
      }
    }
  `, {
    variables: {projectID}
  })
  useEffect(() => {
    if (dataOwner) {
      refetch()
    }
  }, [dataOwner])

  useEffect(() => {
    if (dataDetails) {
      setProject(dataDetails.project)
    }
  }, [dataDetails])

  return {project, editProjectDescription, editProjectName, changeProjectOwnership, loading: R.or(loadingName, loadingDesc, loadingOwner), dataDesc, dataName, dataOwner}
}
