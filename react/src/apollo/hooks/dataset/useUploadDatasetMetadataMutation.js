import {useState, useEffect} from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as RA from 'ramda-adjunct'
import * as R from 'ramda'
import { UPLOAD_DATASET_METADATA } from '../../queries/dataset'

export default function useUploadDatasetMetadataMutation({
  datasetID
}) {
  const [success, setSuccess] = useState(false)
  const [uploadDatasetMetadata, {loading, data, error}] = useMutation(UPLOAD_DATASET_METADATA, {
    variables: {
      datasetID
    },
    onCompleted: ({uploadDatasetMetadata: dataset}) => {
      if (RA.isNotNil(dataset)) {
        setSuccess(true)
      }
    }
  })

  return {uploadDatasetMetadata, loading, success}
}