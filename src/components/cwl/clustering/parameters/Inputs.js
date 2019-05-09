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

const SingleCellInputType = (

) => {

    return withMessageAbove('Select type of single cell experiment')(
        <Button.Group fluid size='large'>
            <Button content='DropSeq' />
            <Button.Or />
            <Button content='10X' />
        </Button.Group>
    )
}

const Resolution = (

) => {

    return withMessageAbove('Select TSNE resolution')(
        <Button.Group fluid size='large' widths={11}
            content={
                R.compose(
                    R.map(num => <Button key={num} content={num} />),
                    R.map(R.toString)
                )(R.range(0,11))
            }
        />
    )
}

const GeneList = (

) => {
    return withMessageAbove('Search and select genes of interest')(
        <Dropdown placeholder='Gene Symbols' fluid multiple selection search
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
    step,
    min,
    max
}) => {
    const [values, setValues] = useState([(min+max)/2])

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
            values={values}
            step={step}
            min={min}
            max={max}
            onChange={values => setValues(values)}
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
                        values,
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
            {values[0].toFixed(2)}
            </output>
        </div>
    )
}

const Opacity = (

) => {
    return withMessageAbove('Description of opacity here, [0,1]')(
        <RangeSlider step={0.1} min={0} max={1} />
    )
}

const PCADimensions = (

) => {

    return withMessageAbove('Number of principal component analysis dimensions')(
        <Button.Group fluid size='large' widths={11}
            content={
                R.compose(
                    R.map(num => <Button key={num} content={num} />),
                    R.map(R.toString)
                )(R.range(0,11))
            }
        />
    )
}

const ReturnThreshold = (

) => {
    return withMessageAbove('description of return_threshold here [0,0.1]')(
        <RangeSlider step={0.01} min={0} max={0.1} />
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
        <SingleCellInputType />
    ),
    makeParameter(
        'resolution',
        'TNSE Resolution',
        <Resolution />
    ),
    makeParameter(
        'gene_list',
        'Genes of Interest',
        <GeneList />
    ),
    makeParameter(
        'opacity',
        'Opacity',
        <Opacity />
    ),
    makeParameter(
        'pca_dimensions',
        'PCA Dimensions',
        <PCADimensions />
    ),
    makeParameter(
        'return_threshold',
        'Return Threshold',
        <ReturnThreshold />
    )
    // makeParameter('project_id', 'Unique name for your project'),
    // makeParameter('mitochondrial_percentage', ''),
    // makeParameter('number_of_genes', 'Approximate number of genes'),
]

export default PARAMETERS