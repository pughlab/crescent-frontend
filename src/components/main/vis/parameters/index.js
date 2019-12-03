import React, { useState } from "react";

import * as R from "ramda";
import * as RA from "ramda-adjunct";

import { Transition, Menu, Segment, Button, Label, Divider, Dropdown, Header, Icon } from "semantic-ui-react";

import withRedux from "../../../../redux/hoc";

import PARAMETERS from "./PARAMETERS";
import { SingleCellInputType, NumberGenes, PercentMito, Resolution, PCADimensions } from "./Inputs";

const ParametersComponent = withRedux(
    ({
        app: {
            toggle: {
                vis: {
                    pipeline: { activeStep: activePipelineStep, parameters }
                }
            }
        },
        actions: { setParameters }
    }) => {
        console.log(parameters);
        const { singleCell, numberGenes, percentMito, resolution, principalDimensions } = parameters;
        const mergeAndSetParameters = R.compose(setParameters, R.mergeRight(parameters));
        const setSingleCell = singleCell => mergeAndSetParameters({ singleCell });
        const setNumberGenes = numberGenes => mergeAndSetParameters({ numberGenes });
        const setPercentMito = percentMito => mergeAndSetParameters({ percentMito });
        const setResolution = resolution => mergeAndSetParameters({ resolution });
        const setPrincipalDimensions = principalDimensions => mergeAndSetParameters({ principalDimensions });

        const isActivePipelineStep = R.equals(activePipelineStep);

        const stepHasNoParameter = R.compose(
            R.and(RA.isNotNil(activePipelineStep)),
            R.isEmpty,
            R.filter(R.propEq("step", activePipelineStep))
        )(PARAMETERS);

        if (R.isNil(activePipelineStep)) {
            return (
                <Segment basic placeholder style={{ height: "100%" }}>
                    <Header textAlign="center" icon>
                        <Icon name="right arrow" />
                        Select a pipeline step on the right to configure parameters
                    </Header>
                </Segment>
            );
        }
        if (stepHasNoParameter) {
            return (
                <Segment basic placeholder style={{ height: "100%" }}>
                    <Header textAlign="center" icon>
                        <Icon name="dont" />
                        Step has no parameters
                    </Header>
                </Segment>
            );
        }
        return (
            <Transition visible animation="fade" duration={1000} unmountOnHide={true} transitionOnMount={true}>
                <Segment basic style={{ height: "100%", overflowY: "scroll" }}>
                    {isActivePipelineStep("quality") ? (
                        <>
                            <SingleCellInputType {...{ singleCell, setSingleCell }} />
                            <Divider />
                            <NumberGenes {...{ numberGenes, setNumberGenes }} />
                            <Divider />
                            <PercentMito {...{ percentMito, setPercentMito }} />
                        </>
                    ) : isActivePipelineStep("reduction") ? (
                        <PCADimensions {...{ principalDimensions, setPrincipalDimensions }} />
                    ) : isActivePipelineStep("clustering") ? (
                        <Resolution {...{ resolution, setResolution }} />
                    ) : null}
                </Segment>
            </Transition>
        );
    }
);

export default ParametersComponent;
