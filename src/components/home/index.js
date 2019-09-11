import React, {useState, useEffect, useRef} from 'react';

import { Segment, Button, Grid, Image, Step } from 'semantic-ui-react'

import VisHeader from './Header'

import Expression from '../expression'

import CWLParamsButton from './ParamsButton'
import CWLStatusButton from './StatusButton'
import CWLResultsButton from './ResultsButton'

import UploadModal from './UploadModal'
import SubmitButton from './SubmitButton'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

// Custom hook
function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const VisualizationComponent = ({
  session,
  currentRunId, setCurrentRunId,
  currentProjectID
}) => {
  // PARAMETERS TO SEND TO RPC
  const [singleCell, setSingleCell] = useState('MTX')
  const [numberGenes, setNumberGenes] = useState({min: 50, max: 8000})
  const [percentMito, setPercentMito] = useState({min: 0, max: 0.2})
  const [resolution, setResolution] = useState(1)
  const [principalDimensions, setPrincipalDimensions] = useState(10)

  // Uploaded files
  const [uploadedBarcodesFile, setUploadedBarcodesFile] = useState(null)    
  const [uploadedGenesFile, setUploadedGenesFile] = useState(null)    
  const [uploadedMatrixFile, setUploadedMatrixFile] = useState(null)
  const notUploaded = R.any(R.isNil, [uploadedBarcodesFile, uploadedGenesFile, uploadedMatrixFile])

  // Local state for notification the result is done
  const [submitted, setSubmitted] = useState(false)
  useEffect(() => setSubmitted(false), [singleCell, resolution, principalDimensions])
  const [loading, setLoading]= useState(false)
  const [result, setResult] = useState(null)
  const [activeToggle, setActiveToggle] = useState('params')
  const isActiveToggle = R.equals(activeToggle)

  useEffect(() => {
    session.subscribe(
      'crescent.result',
      (args, {runID}) => {
        console.log('crescent.result')
        setActiveToggle('results')
        setCurrentRunId(runID)
        setLoading(false)
        setSubmitted(false)
      }
    )
  }, [])

  const [visType, setVisType] = useState('tsne')
  const isCurrentVisType = R.equals(visType)
  useEffect(() => {
    RA.isNotNil(currentRunId) && RA.isNotNil(visType) 
    && fetch(`/result?runID=${currentRunId}&visType=${visType}`)
      .then(response => response.blob())
      .then(R.compose(setResult, URL.createObjectURL))
    && setLoading(false)
  }, [currentRunId, visType])

  return (
    <Segment basic attached='top' style={{height: '92%'}} as={Grid}>
      <Grid.Column width={12} style={{height: '100%'}}>
        <Segment basic loading={loading} style={{height: '100%'}}>
        <VisHeader {...{currentProjectID, currentRunId}} />
        {
          RA.isNotNil(result) && isActiveToggle('results') ?
          isCurrentVisType('tsne') ? <Expression parentcurrentRunId={currentRunId} />
          : <Image src={result} size='big' centered />
          : null
        }
        </Segment>
      </Grid.Column>
      <Grid.Column width={4} style={{height: '100%'}}>
        <Segment attached='top'>
          <Button.Group fluid widths={3}>
            <Button compact={true} content='Parameters' color={isActiveToggle('params') ? 'blue' : undefined}
              active={isActiveToggle('params')} onClick={() => setActiveToggle('params')}
            />
            <Button compact={true} content='Status' color={isActiveToggle('status') ? 'teal' : undefined}
              active={isActiveToggle('status')} onClick={() => setActiveToggle('status')}
            />
            <Button compact={true} content='Results' color={isActiveToggle('results') ? 'violet' : undefined}
              active={isActiveToggle('results')} onClick={() => setActiveToggle('results')}
            />
          </Button.Group>
        </Segment>
        <Segment attached style={{height: '83%', overflowY: 'scroll'}}>
          <Step.Group vertical fluid ordered
            items={
              R.map(
                ({step, visType}) => (
                  isActiveToggle('params') ?
                    <CWLParamsButton key={step} step={step}
                      {...{
                        singleCell, setSingleCell,
                        numberGenes, setNumberGenes,
                        percentMito, setPercentMito,
                        resolution, setResolution,
                        principalDimensions, setPrincipalDimensions,
                      }}
                    />
                  : isActiveToggle('status') ?
                    <CWLStatusButton key={step} step={step} />
                  : isActiveToggle('results') ?
                    <CWLResultsButton key={step} step={step} 
                      onClick={RA.isNotNil(visType) ? () => setVisType(visType) : undefined}
                      active={isCurrentVisType(visType)}
                    />
                  : null
                ),
                [
                  {step: 'Quality Control', visType: 'qc'},
                  {step: 'Normalization', visType: null},
                  {step: 'Dimension Reduction', visType: 'pca'},
                  {step: 'Cell Clustering', visType: 'tsne'},
                  {step: 'Find All Markers', visType: 'markers'},
                ]
              )
            }
          />
        </Segment>
        {
          isActiveToggle('params') ?
            <Button.Group fluid widths={2} attached='bottom' size='big'>
              <UploadModal
                {...{
                  currentProjectID,
                  uploadedBarcodesFile, setUploadedBarcodesFile,
                  uploadedGenesFile, setUploadedGenesFile,
                  uploadedMatrixFile, setUploadedMatrixFile,
                }}
              />
              <Button.Or text='&' />
              <SubmitButton
                {...{
                  currentProjectID,
                  setLoading, loading,
                  setSubmitted, submitted,
                  notUploaded,
                  params: JSON.stringify({
                    singleCell,
                    numberGenes,
                    percentMito,
                    resolution,
                    principalDimensions,
                  })
                }}
              />
            </Button.Group>

          : isActiveToggle('status') ?
            <Segment attached='bottom' inverted color='teal' content='Current step running is...' />

          : isActiveToggle('results') ?
            <Button fluid attached='bottom' size='big' color='violet' icon='download' content='Download'
              disabled={R.isNil(currentRunId)}
              as='a'
              // onClick={() => 
              //   fetch(`/download/${currentRunId}`)
              //     .then(response => response.blob())
              //     .then(objectURL = URL.createObjectURL(blob))
              // }
              href={`/download/${currentRunId}`}
              // href={objectURL}
              download
            />
          : null
        }
      </Grid.Column>
    </Segment>
  )
}

export default VisualizationComponent
