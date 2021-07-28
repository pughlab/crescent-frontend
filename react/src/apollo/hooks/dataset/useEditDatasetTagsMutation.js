import {useState, useEffect} from 'react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { useTagDatasetMutation, useAddCustomTagDatasetMutation, useRemoveCustomTagDatasetMutation } from './'

export default function useEditDatasetTagsMutation(datasetID) {
    const [dataset, setDataset] = useState(null)
    const {dataset: datasetFromTag, tagDataset} = useTagDatasetMutation(datasetID)
    const {dataset: datasetFromAdd, addCustomTagDataset} = useAddCustomTagDatasetMutation(datasetID)
    const {dataset: datasetFromRemove, removeCustomTagDataset}  = useRemoveCustomTagDatasetMutation(datasetID)

    useEffect(() => {
        if (RA.isNotNil(datasetFromTag)) {
            setDataset(datasetFromTag)
        }
    }, [datasetFromTag])

    useEffect(() => {
        if (RA.isNotNil(datasetFromAdd)) {
            setDataset(datasetFromAdd)
        }
    }, [datasetFromAdd])

    useEffect(() => {
        if (RA.isNotNil(datasetFromRemove)) {
            setDataset(datasetFromRemove)
        }
    }, [datasetFromRemove])

    return {dataset, tagDataset, addCustomTagDataset, removeCustomTagDataset}
}