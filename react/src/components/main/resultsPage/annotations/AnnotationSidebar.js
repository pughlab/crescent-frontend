import React from 'react';

import {Accordion} from 'semantic-ui-react'
import * as R from 'ramda'

import {useDispatch} from 'react-redux'
import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'
import {useRunDetailsQuery} from '../../../../apollo/hooks/run'
import {setActiveAnnotationsAction} from '../../../../redux/actions/resultsPage'

const AnnotationsAccordionItem = ({annotationsAction, label, description}) => {
  const dispatch = useDispatch()
  const {activeAnnotationsAction} = useResultsPage()
  const active = R.equals(annotationsAction, activeAnnotationsAction)
  return (
    <>
    <Accordion.Title {...{active, onClick: () => dispatch(setActiveAnnotationsAction({annotationsAction}))}}>
      {label}
    </Accordion.Title>
    <Accordion.Content>
      {description}
    </Accordion.Content>
    </>
  )
}

export default function AnnotationsSidebar () {    
  const {userID: currentUserID, runID} = useCrescentContext()

  const {run} = useRunDetailsQuery(runID)

  if (R.any(R.isNil, [run])) {
    return null
  }
  const {datasets} = run
  const isSingleDatasetRun = R.compose(R.equals(1), R.length)(datasets)

  const ANNOTATIONS_ACTIONS = [
    // ... isSingleDatasetRun ? [] : [{annotationsAction: 'gsva', label: 'GSVA Cell Labelling', description: 'aaa'}]
    {annotationsAction: 'runMetadata', label: 'Custom Metadata', description: 'Upload/replace metadata for this run'},
    {annotationsAction: 'gsva', label: 'GSVA Cluster Labelling', description: 'Run GSVA cell labelling by uploading/replacing geneset for this run'},
    {annotationsAction: 'infercnv', label: 'InferCNV', description: 'Infer copy number alterations from tumour for this run'},



  ]

  return (
    <>
    <Accordion styled>
    {
      R.map(
        (action) => (<AnnotationsAccordionItem key={action.annotationsAction} {...{...action}} />
        ),
        ANNOTATIONS_ACTIONS
      )
    }
    </Accordion>
    </>
  )
}