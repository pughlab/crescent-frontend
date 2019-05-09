import React, {useState} from 'react'
import { Button, Segment, Dropdown, Message, Divider } from 'semantic-ui-react';

import { Range, getTrackBackground } from "react-range";

import * as R from 'ramda'

const withMessageAbove = R.curry(
    (description, InputComponent) => (
        <Segment basic>
            <Message header={description} />
            <Divider />
            {InputComponent}
        </Segment>
    ) 
)

const SingleCellInputType = ({
    singleCell, setSingleCell
}) => {
    const isActive = R.equals(singleCell)
    return withMessageAbove('Select type of single cell experiment')(
        <Button.Group fluid size='large'>
            <Button content='DropSeq'
                active={isActive('DropSeq')}
                onClick={() => setSingleCell('DropSeq')}
            />
            <Button.Or />
            <Button content='10X'
                active={isActive('10X')}
                onClick={() => setSingleCell('10X')}
            />
        </Button.Group>
    )
}

const Resolution = ({
    resolution, setResolution
}) => {
    const isActive = R.equals(resolution)
    return withMessageAbove('Select TSNE resolution')(
        <Button.Group fluid size='large' widths={11}
            content={
                R.map(
                    num => (
                        <Button key={`${num}`} content={num}
                            active={isActive(num)}
                            onClick={() => setResolution(num)}
                        />
                    ),
                    R.range(0,11)
                )
            }
        />
    )
}

const GeneList = ({
    genes, setGenes
}) => {
    return withMessageAbove('Search and select genes of interest')(
        <Dropdown placeholder='Gene Symbols' fluid multiple selection search
            value={genes}
            onChange={(event, {value}) => setGenes(value)}
            options={
                R.map(
                    code => ({key: code, text: code, value: code}),
                    ['MALAT1', 'GAPDH']
                )
            }
        />
    )
}



const RangeSlider = ({
    step, min, max,

    value, onChange
}) => {
    return (
        <div
            style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            margin: "2em"
            }}
        >
            <Range
            values={[value]}
            step={step}
            min={min}
            max={max}
            onChange={onChange}
            renderTrack={({ props, children }) => (
                <div
                onMouseDown={props.onMouseDown}
                onTouchStart={props.onTouchStart}
                style={{
                    ...props.style,
                    height: "36px",
                    display: "flex",
                    width: "100%"
                }}
                >
                <div
                    ref={props.ref}
                    style={{
                    height: "5px",
                    width: "100%",
                    borderRadius: "4px",
                    background: getTrackBackground({
                        values: [value],
                        colors: ["#548BF4", "#ccc"],
                        min,
                        max
                    }),
                    alignSelf: "center"
                    }}
                >
                    {children}
                </div>
                </div>
            )}
            renderThumb={({ props, isDragged }) => (
                <div
                {...props}
                style={{
                    ...props.style,
                    height: "42px",
                    width: "42px",
                    borderRadius: "4px",
                    backgroundColor: "#FFF",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: "0px 2px 6px #AAA"
                }}
                >
                <div
                    style={{
                    height: "16px",
                    width: "5px",
                    backgroundColor: isDragged ? "#548BF4" : "#CCC"
                    }}
                />
                </div>
            )}
            />
            <output style={{ marginTop: "30px" }} id="output">
            {value.toFixed(2)}
            </output>
        </div>
    )
}

const Opacity = ({
    opacity, setOpacity
}) => {
    return withMessageAbove('Description of opacity here, [0,1]')(
        <RangeSlider
            step={0.1} min={0} max={1}
            value={opacity}
            onChange={values => setOpacity(R.head(values))}
        />
    )
}

const PCADimensions = ({
    principalDimensions, setPrincipalDimensions
}) => {
    const isActive = R.equals(principalDimensions)
    return withMessageAbove('Number of principal component analysis dimensions')(
        <Button.Group fluid size='large' widths={11}
            content={
                R.map(
                    num => (
                        <Button key={num} content={num}
                            active={isActive(num)}
                            onClick={() => setPrincipalDimensions(num)}
                        />
                    ),
                    R.range(0,11)
                )
            }
        />
    )
}

const ReturnThreshold = ({
    returnThreshold, setReturnThreshold
}) => {
    return withMessageAbove('description of return_threshold here [0,0.1]')(
        <RangeSlider
            step={0.01} min={0} max={0.1}
            value={returnThreshold}
            onChange={values => setReturnThreshold(R.head(values))}
        />
    )
}

const makeParameter = (
    parameter, label, component
) => ({
    parameter, label, component
})
const PARAMETERS = [
    makeParameter(
        'sc_input_type',
        'Single Cell Input Type',
    ),
    makeParameter(
        'resolution',
        'TNSE Resolution',
    ),
    makeParameter(
        'gene_list',
        'Genes of Interest',
    ),
    makeParameter(
        'opacity',
        'Opacity',
    ),
    makeParameter(
        'pca_dimensions',
        'PCA Dimensions',
    ),
    makeParameter(
        'return_threshold',
        'Return Threshold'
    )
    // makeParameter('project_id', 'Unique name for your project'),
    // makeParameter('mitochondrial_percentage', ''),
    // makeParameter('number_of_genes', 'Approximate number of genes'),
]

export {
    PARAMETERS,
    SingleCellInputType,
    Resolution,
    GeneList,
    Opacity,
    PCADimensions,
    ReturnThreshold
}
