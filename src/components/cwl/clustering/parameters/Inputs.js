import React, {useState} from 'react'
import { Button, Segment, Form, Message, Divider, Label } from 'semantic-ui-react';

import RangeSlider from './RangeSlider'

import * as R from 'ramda'

// parameter: keyword for CWL
// label: menu label when selecting parameter values
// prompt: header of message
// description: content of message
const parameter = (parameter, label, prompt, description) => ({
  parameter, label, prompt, description
})
const PARAMETERS = [
  parameter(
    'sc_input_type',
    'Single Cell Input Type',
    'Select type of single cell input',
    'Input can be either MTX: barcodes.tsv.gz, features.tsv.gz and matrix.mtx.gz files or DGE: tab delimited digital gene expression (DGE) file with genes in rows vs. barcodes in columns. Default is MTX.'
  ),
  parameter(
    'number_genes',
    'Number of Genes',
    'Specify range for number of genes',
    'The minimum and maximum number of unique gene counts in a cell to be included in normalization and clustering analyses. Default is 50 to 8000.'
  ),
  parameter(
    'percent_mito',
    'Mitochondrial Fraction',
    'Specify range of mitochondrial fraction',
    'The minimum and maximum fraction of mitochondrial gene counts in a cell to be included in normalization and clustering analyses. For example, for whole cell scRNA-seq use 0 to 0.2, or for Nuc-seq use 0 to 0.05.'
  ),
  parameter(
    'resolution',
    'Clustering Resolution',
    'Set clustering resolution',
    'Value of the resolution parameter, use a value above 1.0 if you want to obtain a larger number of cell clusters or below 1.0 for a smaller number of cell clusters. Default is 1.0.'
  ),
  parameter(
    'pca_dimensions',
    'PCA Dimensions',
    'Number of dimensions for principal component analysis',
    'Max value of PCA dimensions to use for clustering and t-SNE functions. Default is 10.'
  )
]

const withMessageAbove = R.curry(
    ({parameter, label, prompt, description}, InputComponent) => (
        <Segment basic>
            <Message header={prompt} content={description} color='blue' />
            <Divider />
            {InputComponent}
        </Segment>
    ) 
)

const SingleCellInputType = ({
    singleCell, setSingleCell
}) => {
    const isActive = R.equals(singleCell)
    const activeColor = singleCell => isActive(singleCell) ? 'blue' : undefined
    return withMessageAbove(PARAMETERS[0],
        <Button.Group fluid size='large'>
            <Button content='DGE'
                color={activeColor('DGE')}
                active={isActive('DGE')}
                onClick={() => setSingleCell('DGE')}
            />
            <Button.Or />
            <Button content='MTX'
                color={activeColor('MTX')}
                active={isActive('MTX')}
                onClick={() => setSingleCell('MTX')}
            />
        </Button.Group>
    )
}

const NumberGenes = ({
  numberGenes: {min, max}, setNumberGenes
}) => {
  // console.log(min, max)
  return withMessageAbove(PARAMETERS[1],
    <Form>
      <Form.Group widths={2}>
        <Form.Input label='Min' value={min} onChange={(e, {value}) => setNumberGenes({min: value, max})} />
        <Form.Input label='Max' value={max} onChange={(e, {value}) => setNumberGenes({min, max: value})} />
      </Form.Group>
    </Form>
  )
 
}

const PercentMito = ({
  percentMito: {min, max}, setPercentMito,
}) => {
  // console.log(min, max)
  return withMessageAbove(PARAMETERS[2],
    <Form>
      <Form.Group widths={2}>
        <Form.Input label='Min' value={min} onChange={(e, {value}) => setPercentMito({min: value, max})} />
        <Form.Input label='Max' value={max} onChange={(e, {value}) => setPercentMito({min, max: value})} />
      </Form.Group>
    </Form>
  )
}

const Resolution = ({
    resolution, setResolution
}) => {
    return withMessageAbove(PARAMETERS[3],
        <RangeSlider
            step={0.1} min={0.1} max={2.5}
            value={resolution}
            onChange={values => setResolution(R.head(values))}
        />
    )
}

const PCADimensions = ({
    principalDimensions, setPrincipalDimensions
}) => {
    return withMessageAbove(PARAMETERS[4],
        <RangeSlider
            step={1} min={1} max={50}
            value={principalDimensions}
            onChange={values => setPrincipalDimensions(R.head(values))}
        />
    )
}

export {
    PARAMETERS,
    SingleCellInputType,
    NumberGenes,
    PercentMito,
    Resolution,
    PCADimensions,
}
