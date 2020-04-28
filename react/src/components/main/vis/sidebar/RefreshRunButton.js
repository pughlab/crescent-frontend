import React, { useEffect } from 'react'
import { Button } from 'semantic-ui-react'

import withRedux from '../../../../redux/hoc'

import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { queryIsNotNil } from '../../../../utils'

const RefreshRunButton = withRedux(
  ({
    app: {
      run: {
        runID,
        status: runStatus
      }
    },
    actions: {setRun}
  }) => {
    const { data, loading, refetch } = useQuery(gql`
      query Run($runID: ID) {
        run(runID: $runID) {
          runID
          createdOn
          createdBy {
            userID
            name
          }
          name
          params
          status

          submittedOn
          completedOn
        }
      }
    `, {
      fetchPolicy: 'network-only',
      variables: {runID},
      pollInterval: 30000
    })
    useEffect(() => {
      if (queryIsNotNil('run', data)) {
        const {run} = data
        setRun(run)
      }
    }, [data])
    return (
      <Button fluid color='violet'
        loading={loading}
        content={'Refresh'}
        onClick={() => refetch()}
      />
    )
  }
)

export default RefreshRunButton