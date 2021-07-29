import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks'
import { goBack } from '../../../redux/actions/context'
import { useDispatch } from 'react-redux'


import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { gql } from 'apollo-boost'

export default function useArchiveProjectMutation({projectID}) {
    const dispatch = useDispatch()

    const [archiveProject, { loading, data, error }] = useMutation(gql`
    mutation ArchiveProject($projectID: ID) {
      archiveProject(projectID: $projectID) {
        projectID
        archived
      }
    }
  `, {
    variables: { projectID },
    onCompleted: data => {
      dispatch(goBack())
    }
  })

    return { archiveProject, data, loading }
}