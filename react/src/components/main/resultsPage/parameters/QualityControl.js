import React, {useState, useCallback, useEffect} from 'react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {Divider, Menu, Segment, List, Popup, Grid, Button, Header, Icon, Message, Step} from 'semantic-ui-react'

import PipelineParameter from './PipelineParameter'

import {useRunDatasetsQuery, useToolStepsQuery, useRunParametersDownloadUploadMutation} from '../../../../apollo/hooks'
import {useCrescentContext} from '../../../../redux/hooks'

import {useDropzone} from 'react-dropzone'


const QualityControlTemplateDownloadUploadSegment = ({

}) => {  
  const {runID} = useCrescentContext()
  const {templateDownloadLink, onDrop} = useRunParametersDownloadUploadMutation(runID)
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})
  return (
    <Step.Group fluid widths={2} size='mini'>
      {/* Download button */}
      <Step as='a'
        disabled={R.isNil(templateDownloadLink)}
        download='crescent_qcparameters.csv'
        href={templateDownloadLink}
      >
        <Icon name='download' />
        Download
      </Step>
      {/* Upload button */}
      <Step as='a' {...getRootProps()}>
        <input {...getInputProps()} />
        <Icon name='upload' />
        Upload
      </Step>
    </Step.Group>
  )
}


const QualityControlParametersComponent = ({

}) => {
  const {runID} = useCrescentContext()
  const run = useRunDatasetsQuery(runID)
  const [currentDatasetID, setCurrentDatasetID] = useState(null)
  // Set currentDatasetID as first dataset once run datasets query returned
  useEffect(() => {
    if (RA.isNotNil(run)) {
      R.compose(
        setCurrentDatasetID,
        R.prop('datasetID'), R.head, R.prop('datasets')
      )(run)
    }
  }, [run])

  const toolSteps = useToolStepsQuery()

  if (R.any(R.isNil, [run, toolSteps])) {
    return null
  }

  const {parameters, datasets} = run

  return (
    <Grid>
      <Grid.Column width={10}>
      {
        R.compose(
          R.map(
            ({parameter: parameterCode}) => (
              <PipelineParameter key={`${parameterCode}_${currentDatasetID}`} {...{parameterCode, datasetID: currentDatasetID}} />
            )
          ),
          R.prop('parameters'),
          R.find(R.propEq('step', 'quality'))
        )(toolSteps)
      }
      </Grid.Column>
      <Grid.Column width={6}>
        <Segment.Group>
          <Segment color='blue' inverted>
            <Header textAlign='center' sub size='large' content={`Dataset(s) Quality Control`} />
            <QualityControlTemplateDownloadUploadSegment />
          </Segment>

          <Segment>
            <List size='large'>
              <List.Item>
                <Icon name='download' />
                Download a template CSV file with current parameters
              </List.Item>
              <List.Item>
                <Icon name='edit' />
                Modify QC parameter CSV and save
              </List.Item>
              <List.Item>
                <Icon name='upload' />
                Upload modified template CSV
              </List.Item>
            </List>
          </Segment>

          <Segment>
            <List selection celled size='large'>
            {
              R.map(
                ({datasetID, name, size, hasMetadata}) => (
                  <List.Item key={datasetID}
                    active={R.equals(currentDatasetID, datasetID)}
                    onClick={() => setCurrentDatasetID(datasetID)}
                  >
                    <List.Content>
                      {name}
                      {R.equals(currentDatasetID, datasetID) && <Icon name='eye' color='blue' style={{paddingLeft: 10}} />}
                    </List.Content>
                  </List.Item>
                ),
                datasets
              )
            }
            </List>
          </Segment>
        </Segment.Group>
      </Grid.Column>
    </Grid>
  )
}

export default QualityControlParametersComponent