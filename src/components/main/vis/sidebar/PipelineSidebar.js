import React, { useState, useEffect, useRef } from "react";

import { Segment, Button, Icon, Divider, Step, Menu, Header, Accordion, Dropdown } from "semantic-ui-react";

import * as R from "ramda";
import * as RA from "ramda-adjunct";

import withRedux from "../../../../redux/hoc";

import STEPS from "../parameters/STEPS";

const StepAccordion = withRedux(
    ({
        app: {
            toggle: {
                vis: {
                    pipeline: { activeStep: activePipelineStep }
                }
            }
        },
        actions: {
            toggle: { setActivePipelineStep }
        },
        // Props
        step,
        label
    }) => {
        const isActivePipelineStep = R.equals(activePipelineStep);
        return (
            <>
                <Accordion.Title active={isActivePipelineStep(step)} onClick={() => setActivePipelineStep(step)}>
                    {label}
                    {isActivePipelineStep(step) && <Icon name="eye" color="blue" style={{ paddingLeft: 10 }} />}
                </Accordion.Title>
                <Accordion.Content active={isActivePipelineStep(step)}>
                    <Dropdown options={[]} fluid selection placeholder="Select Tool" />
                </Accordion.Content>
            </>
        );
    }
);

const PipelineSidebar = withRedux(({}) => {
    return (
        <Accordion styled>
            {R.addIndex(R.map)(
                ({ step, label }, index) => (
                    <StepAccordion key={index} {...{ step, label }} />
                ),
                STEPS
            )}
        </Accordion>
    );
});

export default PipelineSidebar;
