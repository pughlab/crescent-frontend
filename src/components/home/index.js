import React, {useState, useEffect} from 'react';

import { Icon, Menu, Header, Segment, Button, Label, Grid, Image, Modal, Divider, Step, Card } from 'semantic-ui-react'

import ClusteringParameterMenu from '../cwl/clustering/parameters/ParametersMenu'

import NormalizationVisualization from '../cwl/normalization'
import AlignmentVisualization from '../cwl/alignment'
import ClusteringVisualization from '../cwl/clustering'

import UploadModal from './UploadModal'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import tsne from '../cwl/clustering/tsne.png'

const CWLStepButton = ({
  step,

  singleCell, setSingleCell,
  resolution, setResolution,
  genes, setGenes,
  opacity, setOpacity,
  principalDimensions, setPrincipalDimensions,
  returnThreshold, setReturnThreshold,
}) => {
  const [openModal, setOpenModal] = useState(false)
  return (
    <Modal size='large'
      open={openModal}
      trigger={
        <Step onClick={() => setOpenModal(true)}>
          {/* <Icon name='check /> */}
          <Step.Content title={step} description={'Tool name goes here'} />
          
        </Step>
      }
    >
      <Modal.Header content={step} />
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
        <Button content='Close'
          onClick={() => {
            console.log('Submitted parameters')
            setOpenModal(false)
          }
          }

        />

      </Modal.Actions>
    </Modal>
  )
}


const VisualizationComponent = ({
  session,
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
  const [loading, setLoading]= useState(false)
  useEffect(() => {
    setSubmitted(false)
  }, [singleCell, resolution, genes, opacity, principalDimensions, returnThreshold])
  useEffect(() => {
    session.subscribe(
      'crescent.result',
      (args, kwargs) => {
        console.log('crescent.result')
        fetch('http://localhost:4001/result')
          .then(response => response.blob())
          .then(R.compose(
            setResult,
            URL.createObjectURL
          ))
        setLoading(false)
      }
    )
  }, [])


  const [result, setResult] = useState(null)
  const uploaded = R.all(RA.isNotNull, [uploadedBarcodesFile, uploadedGenesFile, uploadedMatrixFile])
  // Button with method to call WAMP RPC (not pure)
  const SubmitButton = () => (
    <Button
      content='Submit'
      icon='cloud upload' labelPosition='right'
      color='blue'
      disabled={submitted}
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
        && setLoading(true) && setSubmitted(true)
      }
    />
  )

  const [activeToggle, setActiveToggle] = useState('params')
  const isActiveToggle = R.equals(activeToggle)
  return (
    <Segment attached='top' style={{height: '90%'}} as={Grid}>
      <Grid.Column width={12} style={{height: '100%'}}>
      {
        RA.isNotNil(result) &&
        <Segment basic loading={loading} style={{height: '100%'}}>
          <Image src={result} size='big' />
        </Segment>
      }
      </Grid.Column>
      <Grid.Column width={4} style={{height: '100%'}}>
        <Segment attached='top'>
          <Button.Group fluid widths={3}>
            <Button content='Parameters' color={isActiveToggle('params') ? 'blue' : undefined}
              active={isActiveToggle('params')} onClick={() => setActiveToggle('params')}
            />
            <Button content='Status' color={isActiveToggle('status') ? 'orange' : undefined}
              active={isActiveToggle('status')} onClick={() => setActiveToggle('status')}
            />
            <Button content='Results' color={isActiveToggle('results') ? 'green' : undefined}
              active={isActiveToggle('results')} onClick={() => setActiveToggle('results')}
            />
          </Button.Group>
        </Segment>
        <Segment attached style={{height: '80%', overflowY: 'scroll'}}>
          <Step.Group vertical fluid ordered
            items={
              R.map(
                ({step}) => (
                  <CWLStepButton key={step} step={step}
                    singleCell={singleCell} setSingleCell={setSingleCell}
                    resolution={resolution} setResolution={setResolution}
                    genes={genes} setGenes={setGenes}
                    opacity={opacity} setOpacity={setOpacity}
                    principalDimensions={principalDimensions} setPrincipalDimensions={setPrincipalDimensions}
                    returnThreshold={returnThreshold} setReturnThreshold={setReturnThreshold}
                  />
                ),
                [
                  // {step: 'QC/Alignment'},
                  {step: 'Normalization'},
                  {step: 'Dimension Reduction'},
                  {step: 'Cell Clustering'},
                  // {step: 'Differential Expression'},
                  {step: 'Visualizations'},
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
          <Segment attached='bottom' inverted color='orange' content='Current step running is...' />

          : isActiveToggle('results') ?
          <Button fluid attached='bottom' size='big' color='green' icon='download' content='Download'
            as='a'
            href='http://localhost:4001/download'
            download
          />
          : null
        }
      </Grid.Column>
    </Segment>
  )
}

export default VisualizationComponent