import React from 'react'

import {Image, Segment, Grid } from 'semantic-ui-react'

import * as R from 'ramda'

import Tada from 'react-reveal/Tada'
import Logo from '../../../login/logo.jpg'

// import AnnotationsSecondaryRuns from './AnnotationsSecondaryRuns'
import UploadSampleAnnotsButton from './UploadSampleAnnotsButton'
import UploadGenePosButton from './UploadGenePosButton'
import AddNormalCellTypesButton from './AddNormalCellTypesButton'
import {useCrescentContext} from '../../../../redux/hooks'
import {useRunDetailsQuery} from '../../../../apollo/hooks/run'

import AnnotationsSecondaryRuns from './AnnotationsSecondaryRuns'

export default function InferCNV({
  runID
}) {
  const {userID: currentUserID} = useCrescentContext()
  const {run} = useRunDetailsQuery(runID)

  // const {uploadSampleAnnots, loading, success} = useUploadSampleAnnotsMutation({runID})
  // const [sampleAnnotsFile, setSampleAnnotsFile] = useState(null)
  // useEffect(() => {if (success) setSampleAnnotsFile(null)}, [success])
  // const onDrop = useCallback(acceptedFiles => {if (RA.isNotEmpty(acceptedFiles)) {setSampleAnnotsFile(R.head(acceptedFiles))}}, [])
  // const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

	const annotationType = 'InferCNV'

  if (R.any(R.isNil, [run])) {
    return (
      <Segment basic style={{ height: '100%' }} placeholder>
        <Tada forever duration={1000}>
          <Image src={Logo} centered size='medium' />
        </Tada>
      </Segment>
    )
  }

  // const {status: runStatus, name: runName, createdBy: {userID: creatorUserID}} = run
  // const disabledUpload = R.not(R.equals(currentUserID, creatorUserID))
  
  const {secondaryRuns} = run


  return (
    <>
    <Grid>
      <Grid.Row>
        <Grid.Column>
            <UploadSampleAnnotsButton {...{runID}} />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
            <AddNormalCellTypesButton {...{runID}} />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
            <UploadGenePosButton {...{runID}} />
        </Grid.Column>
      </Grid.Row>
      </Grid>

      <AnnotationsSecondaryRuns {...{secondaryRuns, annotationType}} />
    </>
  )
}