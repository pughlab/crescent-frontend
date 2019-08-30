import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import React from 'react';

import { Header } from 'semantic-ui-react'

import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

const VisHeader = ({
  currentProjectID, currentRunId
}) => {
  const {loading: projectLoading, data: projectData} = useQuery(gql`
    query ProjectDetails($projectID: ID!) {
      project(projectID: $projectID) {
        projectID
        name
      }
    }
  `, {
    variables: {projectID: currentProjectID}
  })
  const {loading: runLoading, data: runData} = useQuery(gql`
    query RunDetails($runID: ID!) {
      run(runID: $runID) {
        runID
        name
      }
    }
  `, {
    variables: {runID: currentRunId},
    skip: R.isNil(currentRunId)
  })
  const isDataReturned = (query, data) => R.both(
    RA.isNotNilOrEmpty,
    R.propSatisfies(RA.isNotNil, query)
  )(data)
  return ( 
    <Header block>
      <Header.Content>
        {
          isDataReturned('project', projectData) &&
          `${R.path(['project','name'], projectData)} (ID ${R.path(['project','projectID'], projectData)})`
        }
        {
          isDataReturned('run', runData) &&
          <Header.Subheader
            content={`${R.path(['run','name'], runData)} (ID ${R.path(['run','runID'], runData)})`}
          /> 
        }
      </Header.Content>
    </Header>
  )

}

export default VisHeader