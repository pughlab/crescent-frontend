import React, {useState, useCallback, useEffect} from 'react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {Divider, Menu, Segment, List, Popup, Grid, Button, Header, Icon, Message, Step} from 'semantic-ui-react'

import withRedux from '../../../../redux/hoc'

import TOOLS from './TOOLS'
import {FloatParameterInput, IntegerParameterInput, RangeParameterInput, SelectParameterInput} from './ParameterInputs'

import * as jsonexport from 'jsonexport/dist'
import * as papaparse from 'papaparse'

import {useDropzone} from 'react-dropzone'

const QualityControlTemplateDownloadUploadSegment = withRedux(
  ({
    app: {
      run: {
        datasets
      },
      toggle: {
        vis: {
          pipeline: {
            parameters
          }
        }
      } 
    },
    actions: {
      setParameters
    }
  }) => {
    const {datasetsQualityControl} = parameters
    // For downloading current QC as table
    const [templateDownloadLink, setTemplateDownloadLink] = useState(null)

    // Create downloadable CSV representing datasetsQualityControl as a table
    useEffect(() => {
      jsonexport(
        // Get qc parameters by dataset
        R.compose(
          R.map(
            ({datasetID, name}) => ({
              datasetID,
              name,
              ... R.prop(datasetID, datasetsQualityControl)
            })
          )
        )(datasets),
        // Convert qc parameter JSON into CSV and set as download link
        (err, csv) => {
          if (err) {
            return console.log('QC template download error', err)
          } else {
            R.compose(
              setTemplateDownloadLink,
              blob => window.URL.createObjectURL(blob),
              data => new Blob([data], {type: 'text/csv'})
            )(csv)
          }
        })
    }, [datasetsQualityControl])

    // Callback function for drag and drop
    // Take first file and parse as CSV then put into redux as 'datasetsQualityControl'
    const onDrop = useCallback(acceptedFiles => {
      if (RA.isNotEmpty(acceptedFiles)) {
        papaparse.parse(acceptedFiles[0], {
          complete: json => {
            const {data, errors, meta} = json
            const headers = R.head(data)
            const body = R.tail(data)
            const headerLens = R.map(R.compose(R.lensPath, R.split('.')), headers)
            const newDatasetsQualityControl = R.reduce(
              (rowsObject, row) => {
                const rowObj = R.compose(
                  R.addIndex(R.reduce)(
                    (rowObj, lens, index) => R.set(lens, R.nth(index, row), rowObj),
                    {}
                  )
                )(headerLens)
                const {datasetID, name, ...rowObjParameters} = rowObj
                return R.set(R.lensProp(datasetID), rowObjParameters, rowsObject)
              },
              {},
              body
            )
            R.compose(
              setParameters,
              R.mergeRight(parameters),
              R.objOf('datasetsQualityControl')
            )(newDatasetsQualityControl)
          },
          error: (err, file) => console.log('QC template upload error', err, file)
        })
      }
    }, [])
    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

    return (
      <Segment textAlign='center'>
        <Popup
          wide='very'
          trigger={
            <Step.Group fluid widths={2} size='mini'>
              {/* Download button */}
              <Step as='a'
                icon='download'
                disabled={R.isNil(templateDownloadLink)}
                as='a'
                download='test.csv'
                href={templateDownloadLink}
              />
              
              {/* Upload button */}
              <Step as='a' {...getRootProps()}>
                <input {...getInputProps()} />
                <Icon name='upload' />
              </Step>
              
            </Step.Group>
          }
        >
          <Popup.Header content='To change multiple dataset QC:' />
          <Popup.Content>
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
          </Popup.Content>
        </Popup>

      </Segment>
    )
  }
)

const QualityControlParametersComponent = withRedux(
  ({
    app: {
      user: {
        userID: currentUserID
      },
      run: {
        createdBy: {
          userID: creatorUserID
        },
        status: runStatus,

        datasets
      },
      toggle: {
        vis: {
          pipeline: {
            activeStep: activePipelineStep,
            parameters,
            isSubmitted,
          }
        }
      }
    },
    actions: {
      setParameters
    }
  }) => {
    const {datasetsQualityControl} = parameters
    const [currentDataset, setCurrentDataset] = useState(R.compose(R.head, R.keys)(datasetsQualityControl))
    const [currentDatasets, setCurrentDatasets] = useState(R.keys(datasetsQualityControl))

    const mergeAndSetParameters = R.compose(
      setParameters,
      R.mergeRight(parameters),
      R.objOf('datasetsQualityControl'),
      R.mergeRight(datasetsQualityControl),
      x => {console.log(x, datasetsQualityControl); return x},
      R.objOf(currentDataset),
      // {singleCell, ...}
      R.mergeRight(R.prop(currentDataset, datasetsQualityControl))
    )

    const valueSetters = {
      'sc_input_type': singleCell => mergeAndSetParameters({singleCell}),
      'number_genes': numberGenes => mergeAndSetParameters({numberGenes}),
      'percent_mito': percentMito => mergeAndSetParameters({percentMito}),
    }

    const currentUserNotCreator = R.not(R.equals(currentUserID, creatorUserID))
    const runNotPending = R.compose(R.not, R.equals('pending'))(runStatus)
    return (
      <Grid>
        <Grid.Column width={10}>
          {
            R.isNil(currentDataset) ? 
              <Segment placeholder>
                <Header icon>
                  Need to set
                </Header>
              </Segment>
            :
              <Segment basic
                disabled={R.any(RA.isTrue, [
                  currentUserNotCreator,
                  isSubmitted,
                  runNotPending
                ])}
              >

                {
                  R.compose(
                    R.addIndex(R.map)(
                      (parameter, index) => {
                        const {parameter: parameterName, input: {type}, disabled} = parameter
                        const setValue = R.prop(parameterName, valueSetters)
                        console.log(currentDataset, parameterName, datasetsQualityControl)
                        const value = R.compose(
                          R.prop(parameterName),
                          ({singleCell, numberGenes, percentMito}) => ({
                            'sc_input_type': singleCell,
                            'number_genes': numberGenes,
                            'percent_mito': percentMito,
                          }),
                          R.prop(currentDataset)
                        )(datasetsQualityControl)
                        return R.cond([
                          [R.equals('range'), R.always(
                            <RangeParameterInput
                              {...{parameter, value, setValue}}
                            />
                          )],
                          [R.equals('float'), R.always(
                            <FloatParameterInput
                              {...{parameter, value, setValue}}
                            />
                          )],
                          [R.equals('integer'), R.always(
                            <IntegerParameterInput
                              {...{parameter, value, setValue
                              }}
                            />
                          )],
                          [R.equals('select'), R.always(
                            <SelectParameterInput
                              {...{parameter, value, setValue}}
                            />
                          )],
                        ])(type)
                      },
                    ),
                    R.prop('parameters'),
                    // R.find(R.propEq('step', activePipelineStep)),
                    R.find(R.propEq('step', 'quality')),
                    R.prop('SEURAT')
                  )(TOOLS)
                }
              </Segment>
          }
        </Grid.Column>
        <Grid.Column width={6}>
        <Segment.Group>
            <Segment color='blue' inverted>
              <Header textAlign='center' sub size='large'>
                {`Dataset QC`}
              </Header>
            </Segment>

            <QualityControlTemplateDownloadUploadSegment />

            <Segment>
              <List selection celled size='large'>
              {
                R.map(
                  ({datasetID, name, size, hasMetadata}) => (
                    <List.Item key={datasetID}
                      active={R.equals(currentDataset, datasetID)}
                      onClick={() => setCurrentDataset(datasetID)}

                    >
                      <List.Content>
                        {name}
                        {
                          R.equals(currentDataset, datasetID) &&
                            <Icon name='eye' color='blue' style={{paddingLeft: 10}} />
                        }
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
)

export default QualityControlParametersComponent