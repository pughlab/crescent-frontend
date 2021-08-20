import {useState, useEffect} from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { PROJECT_DETAILS, UPDATE_PROJECT_DESCRIPTION, UPDATE_PROJECT_NAME, CHANGE_PROJECT_OWNERSHIP } from '../../queries/project'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { gql } from 'apollo-boost'

// custom hook to edit project details
export default function useEditProjectDetailsMutation({projectID}) {
  const [project, setProject] = useState(null)
  const {data: dataDetails, refetch} = useQuery(PROJECT_DETAILS, {
    fetchPolicy: 'network-only',
    variables: {projectID},
  })

  // using the useMutation hook to get a mutate function (editProjectDescription) that we can call to execute the mutation
  const [editProjectDescription, {loading: loadingDesc, data: dataDesc, error: errorDesc}] = useMutation(UPDATE_PROJECT_DESCRIPTION, {
    variables: {projectID}
  })
  useEffect(() => {
    if (dataDesc) {
      refetch()
    }
  }, [dataDesc])

  const [editProjectName, {loading: loadingName, data: dataName, error: errorName}] = useMutation(UPDATE_PROJECT_NAME, {
    variables: {projectID}
  })
  useEffect(() => {
    if (dataName) {
      refetch()
    }
  }, [dataName])

  const [changeProjectOwnership, {loading: loadingOwner, data: dataOwner, error: errorOwner}] = useMutation(CHANGE_PROJECT_OWNERSHIP, {
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