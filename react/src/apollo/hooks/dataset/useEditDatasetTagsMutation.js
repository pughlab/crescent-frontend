import {useState, useEffect} from 'react'
import * as R from 'ramda'

import { useTagDatasetMutation, useAddCustomTagDatasetMutation, useRemoveCustomTagDatasetMutation } from './'

export default function useEditDatasetTagsMutation(datasetID) {
    const [dataset, setDataset] = useState(null)
    const {dataset: datasetFromTag, tagDataset} = useTagDatasetMutation(datasetID)
    const {dataset: datasetFromAdd, addCustomTagDataset} = useAddCustomTagDatasetMutation(datasetID)
    const {dataset: datasetFromRemove, removeCustomTagDataset}  = useRemoveCustomTagDatasetMutation(datasetID)

    useEffect(() => {
        setDataset(datasetFromTag)
    }, [datasetFromTag])

    useEffect(() => {
        R.isNil(datasetFromAdd) ? setDataset(datasetFromAdd) : setDataset({...dataset, customTags: datasetFromAdd.customTags})
    }, [datasetFromAdd])

    useEffect(() => {
        R.isNil(datasetFromRemove) ? setDataset(datasetFromRemove) : setDataset({...dataset, customTags: datasetFromRemove.customTags})
    }, [datasetFromRemove])

    return {dataset, tagDataset, addCustomTagDataset, removeCustomTagDataset}
}