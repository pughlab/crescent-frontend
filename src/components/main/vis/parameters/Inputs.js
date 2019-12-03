import React from "react";
import { Button, Segment, Form, Message } from "semantic-ui-react";

import RangeSlider from "./RangeSlider";

import * as R from "ramda";

import PARAMETERS from "./PARAMETERS";

const withMessageAbove = R.curry(({ parameter, label, prompt, description }, InputComponent) => (
    <Segment basic>
        <Message header={prompt} content={description} color="blue" />
        {InputComponent}
    </Segment>
));

const SingleCellInputType = ({ singleCell, setSingleCell }) => {
    const isActive = R.equals(singleCell);
    const activeColor = singleCell => (isActive(singleCell) ? "blue" : undefined);
    return withMessageAbove(
        PARAMETERS[0],
        <Button.Group fluid size="large">
            <Button
                content="DGE"
                color={activeColor("DGE")}
                active={isActive("DGE")}
                onClick={() => setSingleCell("DGE")}
            />
            <Button.Or />
            <Button
                content="MTX"
                color={activeColor("MTX")}
                active={isActive("MTX")}
                onClick={() => setSingleCell("MTX")}
            />
        </Button.Group>
    );
};

const NumberGenes = ({ numberGenes: { min, max }, setNumberGenes }) => {
    // console.log(min, max)
    return withMessageAbove(
        PARAMETERS[1],
        <Form>
            <Form.Group widths={2}>
                <Form.Input label="Min" value={min} onChange={(e, { value }) => setNumberGenes({ min: value, max })} />
                <Form.Input label="Max" value={max} onChange={(e, { value }) => setNumberGenes({ min, max: value })} />
            </Form.Group>
        </Form>
    );
};

const PercentMito = ({ percentMito: { min, max }, setPercentMito }) => {
    // console.log(min, max)
    return withMessageAbove(
        PARAMETERS[2],
        <Form>
            <Form.Group widths={2}>
                <Form.Input label="Min" value={min} onChange={(e, { value }) => setPercentMito({ min: value, max })} />
                <Form.Input label="Max" value={max} onChange={(e, { value }) => setPercentMito({ min, max: value })} />
            </Form.Group>
        </Form>
    );
};

const Resolution = ({ resolution, setResolution }) => {
    return withMessageAbove(
        PARAMETERS[3],
        <RangeSlider
            step={0.1}
            min={0.1}
            max={2.5}
            value={resolution}
            onChange={values => setResolution(R.head(values))}
        />
    );
};

const PCADimensions = ({ principalDimensions, setPrincipalDimensions }) => {
    return withMessageAbove(
        PARAMETERS[4],
        <RangeSlider
            step={1}
            min={1}
            max={50}
            value={principalDimensions}
            onChange={values => setPrincipalDimensions(R.head(values))}
        />
    );
};

export { SingleCellInputType, NumberGenes, PercentMito, Resolution, PCADimensions };
