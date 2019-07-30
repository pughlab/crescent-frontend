import React, {useState, useEffect} from 'react';

import { Icon, Menu, Dropdown, Header, Segment, Button, Label, Grid, Image, Modal, Divider, Step, Card } from 'semantic-ui-react'

import ClusteringParameterMenu from '../cwl/clustering/parameters/ParametersMenu'

import NormalizationVisualization from '../cwl/normalization'
import AlignmentVisualization from '../cwl/alignment'
import ClusteringVisualization from '../cwl/clustering'

import UploadModal from './UploadModal'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const CWLResultsButton = ({
  step,
  onClick,
  active
}) => (
  <Step onClick={onClick} >
    <Step.Content title={step} description='Seurat' />
  </Step>
)

const CWLStatusButton = ({
  step
}) => {
  const [openModal, setOpenModal] = useState(false)
  return (
    <Modal size='large'
      open={openModal}
      trigger={
        <Step onClick={() => setOpenModal(true)}>
          <Step.Content title={step}  description='Seurat' />
        </Step>
      }
    >
      <Modal.Header content={`${step} Status`} />
      <Modal.Content scrolling>
        STDOUT goes here
      </Modal.Content>
      <Modal.Actions>
          <Button content='Close' onClick={() => setOpenModal(false)} />
      </Modal.Actions>
    </Modal>
  )
}

const CWLParamsButton = ({
  step,

  singleCell, setSingleCell,
  resolution, setResolution,
  genes, setGenes,
  opacity, setOpacity,
  principalDimensions, setPrincipalDimensions,
  returnThreshold, setReturnThreshold,
}) => {
  const [openModal, setOpenModal] = useState(false)
  const [tool, setTool] = useState('seurat')
  return (
    <Modal size='large'
      open={openModal}
      trigger={
        <Step onClick={() => setOpenModal(true)}>
          <Step.Content title={step} description={'Seurat'} />
        </Step>
      }
    >
      <Modal.Header>
        <Dropdown
          placeholder='Select Friend'
          fluid
          selection
          options={[
            {key: 'seurat', text: 'Seurat', value:'seurat'}
          ]}
          value={tool}
        />
      </Modal.Header>
      <Modal.Content scrolling>
        <ClusteringParameterMenu
          singleCell={singleCell} setSingleCell={setSingleCell}
          resolution={resolution} setResolution={setResolution}
          genes={genes} setGenes={setGenes}
          opacity={opacity} setOpacity={setOpacity}
          principalDimensions={principalDimensions} setPrincipalDimensions={setPrincipalDimensions}
          returnThreshold={returnThreshold} setReturnThreshold={setReturnThreshold}
        />
      </Modal.Content>
      <Modal.Actions>
        <Button content='Close' onClick={() => setOpenModal(false)} />
      </Modal.Actions>
    </Modal>
  )
}


const VisualizationComponent = ({
  session,
  currentRunId, setCurrentRunId
}) => {
  // PARAMETERS TO SEND TO RPC
  const [singleCell, setSingleCell] = useState('10X')
  const [resolution, setResolution] = useState(1)
  const [genes, setGenes] = useState(['MALAT1', 'GAPDH'])
  const [opacity, setOpacity] = useState(0.1)
  const [principalDimensions, setPrincipalDimensions] = useState(10)
  const [returnThreshold, setReturnThreshold] = useState(0.01)
  // Uploaded files
  const [uploadedBarcodesFile, setUploadedBarcodesFile] = useState(null)    
  const [uploadedGenesFile, setUploadedGenesFile] = useState(null)    
  const [uploadedMatrixFile, setUploadedMatrixFile] = useState(null)

  // Local state for notification the result is done
  const [submitted, setSubmitted] = useState(false)
  useEffect(() => {
    setSubmitted(false)
  }, [singleCell, resolution, genes, opacity, principalDimensions, returnThreshold])
  const [loading, setLoading]= useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    session.subscribe(
      'crescent.result',
      (args, {runId}) => {
        console.log('crescent.result')
        setCurrentRunId(runId)
        setLoading(false)
        setSubmitted(false)
      }
    )
  }, [])

  const [visType, setVisType] = useState('tsne')
  const isCurrentVisType = R.equals(visType)
  useEffect(() => {
    RA.isNotNil(currentRunId)
    && fetch(`/result?runId=${currentRunId}&visType=${visType}`)
      .then(response => response.blob())
      .then(R.compose(
          setResult,
          URL.createObjectURL
      ))
    && setLoading(false)
  }, [currentRunId, visType])

  
  // Button with method to call WAMP RPC (not pure)
  const notUploaded = R.any(R.isNil, [uploadedBarcodesFile, uploadedGenesFile, uploadedMatrixFile])
  const SubmitButton = () => (
    <Button
      content='Submit'
      icon='cloud upload' labelPosition='right'
      color='blue'
      disabled={submitted || loading || notUploaded}
      // onClick={() => setSubmitted(true)}
      onClick={() =>
        session.call('crescent.submit', [], {
          singleCell,
          resolution,
          genes,
          opacity,
          principalDimensions,
          returnThreshold
        })
        && setLoading(true)
        && setSubmitted(true)
      }
    />
  )

  const [activeToggle, setActiveToggle] = useState('params')
  const isActiveToggle = R.equals(activeToggle)
 
  return (
    <Segment attached='top' style={{height: '90%'}} as={Grid}>
      <Grid.Column width={12} style={{height: '100%'}}>
      <Segment basic loading={loading} style={{height: '100%'}}>
      <Header block 
        content={
          RA.isNotNull(currentRunId) ? `Job ID: ${currentRunId}`
          : loading ? 'Processing...'
          : R.not(submitted) ? 'CReSCENT:\xa0\xa0CanceR Single Cell ExpressioN Toolkit'
          : ''
        }
      />
      {
        isActiveToggle('results') &&
        RA.isNotNil(result) && 
        <TsnePlot />
      }
      </Segment>
      </Grid.Column>
      <Grid.Column width={4} style={{height: '100%'}}>
        <Segment attached='top'>
          <Button.Group fluid widths={3}>
            <Button content='Parameters' color={isActiveToggle('params') ? 'blue' : undefined}
              active={isActiveToggle('params')} onClick={() => setActiveToggle('params')}
            />
            <Button content='Status' color={isActiveToggle('status') ? 'teal' : undefined}
              active={isActiveToggle('status')} onClick={() => setActiveToggle('status')}
            />
            <Button content='Results' color={isActiveToggle('results') ? 'violet' : undefined}
              active={isActiveToggle('results')} onClick={() => setActiveToggle('results')}
            />
          </Button.Group>
        </Segment>
        <Segment attached style={{height: '80%', overflowY: 'scroll'}}>
          <Step.Group vertical fluid ordered
            items={
              R.map(
                ({step, visType}) => (
                  isActiveToggle('params') ?
                    <CWLParamsButton key={step} step={step}
                      singleCell={singleCell} setSingleCell={setSingleCell}
                      resolution={resolution} setResolution={setResolution}
                      genes={genes} setGenes={setGenes}
                      opacity={opacity} setOpacity={setOpacity}
                      principalDimensions={principalDimensions} setPrincipalDimensions={setPrincipalDimensions}
                      returnThreshold={returnThreshold} setReturnThreshold={setReturnThreshold}
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
                  // {step: 'QC/Alignment'},
                  {step: 'Normalization', visType: null},
                  {step: 'Dimension Reduction', visType: 'pca'},
                  {step: 'Cell Clustering', visType: 'tsne'},
                  {step: 'Find All Markers', visType: 'markers'},
                  // {step: 'Differential Expression'},
                  // {step: 'Visualizations'},
                  // {step: 'Cell Cluster Labelling'},
                  // {step: 'Gene/Pathway Interactions'},
                ]
              )
            }
          />
        </Segment>
        {
          isActiveToggle('params') ?
          <Button.Group fluid widths={2} attached='bottom' size='big'>
            <UploadModal
              // pass setState stuff here
              uploadedBarcodesFile={uploadedBarcodesFile}
              setUploadedBarcodesFile={setUploadedBarcodesFile}
              uploadedGenesFile={uploadedGenesFile}
              setUploadedGenesFile={setUploadedGenesFile}
              uploadedMatrixFile={uploadedMatrixFile}
              setUploadedMatrixFile={setUploadedMatrixFile}
            />
            <Button.Or text='&' />
            <SubmitButton />

          </Button.Group>

          : isActiveToggle('status') ?
          <Segment attached='bottom' inverted color='teal' content='Current step running is...' />

          : isActiveToggle('results') ?
          <Button fluid attached='bottom' size='big' color='violet' icon='download' content='Download'
            disabled={R.isNil(currentRunId)}
            as='a'
            href={`/download?runId=${currentRunId}`}
            download
          />
          : null
        }
      </Grid.Column>
    </Segment>
  )
}

export default VisualizationComponent
