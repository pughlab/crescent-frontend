import {useEffect, useState} from 'react'
import {useQuery} from '@apollo/react-hooks'
import {gql} from 'apollo-boost'
import {grapheneClient as client} from '../../clients'
import * as RA from 'ramda-adjunct'

export default function useSampleAnnots(runID) {
  const [sampleAnnots, setSampleAnnots] = useState(null)

  const {data, refetch: refetchSampleAnnots} = useQuery(gql`
    query SampleAnnots($runID: ID) {
      sampleAnnots(runID: $runID)
    }
  `, {
    client,
    fetchPolicy: 'network-only',
    variables: {runID}
  })

  useEffect(() => {
    if (RA.isNotNil(data)) {
      const {sampleAnnots} = data
      
      setSampleAnnots(sampleAnnots)
    }
  }, [data])

  return {refetchSampleAnnots, sampleAnnots}
}

