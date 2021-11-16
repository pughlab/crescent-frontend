import {useState, useEffect} from 'react'
import {useMutation, useQuery} from '@apollo/react-hooks'
import {gql} from 'apollo-boost'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import {useDispatch} from 'react-redux'
import {goBack} from '../../../redux/actions/context'
import {resetProjectArchive} from '../../../redux/actions/projectArchive'

const useProjectArchiveMutation = projectID => {
  const dispatch = useDispatch()
  const [project, setProject] = useState(null)

  const {data: projectDetailsData} = useQuery(gql`
    query ProjectDetails($projectID: ID) {
      project(projectID: $projectID) {
        projectID
        kind
        name
        description
        accession
        externalUrls {
          label
          link
          type
        }
        sharedWith {
          userID
          name
        }
        createdBy {
          userID
          name
        }
        createdOn

        archived

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
          hasMetadata
          size
          cancerTag
          oncotreeCode
          customTags
        }
      }
    }
  `, {
    variables: {projectID},
    fetchPolicy: 'network-only'
  })

  useEffect(() => {
    if (RA.isNotNil(projectDetailsData)) setProject(projectDetailsData.project)
  }, [projectDetailsData])

  const [archiveProject, {loading: archiveProjectLoading, data: archiveProjectData}] = useMutation(gql`
    mutation ArchiveProject($projectID: ID!) {
      archiveProject(projectID: $projectID)
    }
  `, {
    variables: {projectID},
    onCompleted: ({archiveProject}) => {
      if (archiveProject) {
        dispatch(goBack({comparePagePlots: null}))
        dispatch(resetProjectArchive())
      }
    }
  })

  const [archiveRuns, {loading: archiveRunsLoading, data: archiveRunsData}] = useMutation(gql`
    mutation ArchiveRuns($runIDs: [ID!]!) {
      archiveRuns(runIDs: $runIDs)
    }
  `, {
    onCompleted: ({archiveRuns}) => {
      if (archiveRuns) dispatch(resetProjectArchive())
    }
  })

  return {archiveProject, archiveProjectData, archiveRuns, archiveRunsData, loading: R.or(archiveProjectLoading, archiveRunsLoading), project}
}

export default useProjectArchiveMutation