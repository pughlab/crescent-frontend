import {useState} from 'react'
import {useQuery} from '@apollo/react-hooks'
import {gql} from 'apollo-boost'
import {grapheneClient as client} from '../../clients'

export default function useSampleAnnots(runID) {
  const [sampleAnnots, setSampleAnnots] = useState(null)

  const {refetch: refetchSampleAnnots} = useQuery(gql`
    query SampleAnnots($runID: ID) {
      sampleAnnots(runID: $runID)
    }
  `, {
    client,
    fetchPolicy: 'network-only',
    variables: {runID},
    onCompleted: ({sampleAnnots}) => {
      setSampleAnnots(sampleAnnots)
    }
  })

  return {refetchSampleAnnots, sampleAnnots}
}

