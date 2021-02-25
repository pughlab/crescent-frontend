import React, {useState, useCallback, useEffect} from 'react'

import {Button, Icon, Segment, Header, Message } from 'semantic-ui-react'

import {useDropzone} from 'react-dropzone'

import * as RA from 'ramda-adjunct'
import * as R from 'ramda'

import {useUploadRunMetadataMutation} from '../../../../apollo/hooks/run'
import {useCrescentContext} from '../../../../redux/hooks'
import {useRunDetailsQuery} from '../../../../apollo/hooks/run'


export default function ReferenceDatasets({
  runID
}) {
  
  const run = useRunDetailsQuery(runID)

  if (R.any(R.isNil, [run])) {
    return null
  }

  const {datasets} = run

  return (
    <>
      <Message color='teal'>
        <Icon name='upload'/>
        Select which run datasets to use as reference/anchors
      </Message>
      <Segment color='teal'>
      {}
      </Segment>
    </>
  )
}