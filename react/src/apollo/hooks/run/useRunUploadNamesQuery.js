import {useEffect, useState} from 'react'
import {useQuery} from '@apollo/react-hooks'
import {gql} from 'apollo-boost'
import * as RA from 'ramda-adjunct'

const useRunUploadNamesQuery = (runID) => {
  const [uploadNames, setUploadNames] = useState(null)

  const {data, refetch: refetchUploadNames} = useQuery(gql`
    query RunUploadNames($runID: ID) {
      run(runID: $runID) {
        uploadNames {
          gsva
          metadata
        }
      }
    }
  `, {
    fetchPolicy: 'network-only',
    variables: {runID}
  })

  useEffect(() => {
    if (RA.isNotNil(data)) {
      const {run: {uploadNames}} = data

      setUploadNames(uploadNames)
    }
  }, [data])

  return {refetchUploadNames, uploadNames}
}

export default useRunUploadNamesQuery