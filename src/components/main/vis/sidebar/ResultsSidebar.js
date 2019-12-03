import React, { useState, useEffect, useRef } from "react";

import { Segment, Button, Icon, Divider, Step } from "semantic-ui-react";
import * as R from "ramda";
import * as RA from "ramda-adjunct";

import withRedux from "../../../../redux/hoc";
import VisualizationMenu from "../results/VisualizationMenu";

const ResultsSidebar = withRedux(
    ({
        app: {
            run: { runID },
            toggle: {
                vis: {
                    results: { activeResult, availablePlots }
                }
            }
        },
        actions: {
            toggle: { setActiveResult },
            thunks: { initializeResults, clearResults }
        }
    }) => {
        useEffect(() => {
            initializeResults(runID);
            return clearResults();
        }, [clearResults, initializeResults, runID]);

        const isActiveResult = R.equals(activeResult);
        return R.isNil(activeResult) ? (
            <Step.Group vertical fluid size="small">
                {R.ifElse(
                    R.isEmpty,
                    R.always(
                        <Step key={"noresults"}>
                            <Step.Content
                                title={"No Results Available"}
                                description={"Please run the pipeline to view results"}
                            />
                        </Step>
                    ),
                    R.addIndex(R.map)(({ result, label, description }, index) => (
                        <Step key={index} onClick={() => setActiveResult(result)}>
                            {isActiveResult(result) && <Icon name="eye" color="violet" />}
                            <Step.Content title={label} description={description} />
                        </Step>
                    ))
                )(R.values(availablePlots))}
            </Step.Group>
        ) : (
            <Segment>
                <Button color="violet" fluid onClick={() => setActiveResult(null)} animated="fade">
                    <Button.Content visible>
                        {R.compose(R.prop("label"), R.find(R.propEq("result", activeResult)))(R.values(availablePlots))}
                    </Button.Content>
                    <Button.Content hidden>
                        <Icon name="angle left" />
                        Click to go back
                    </Button.Content>
                </Button>
                <Divider />
                <VisualizationMenu />
            </Segment>
        );
    }
);

export default ResultsSidebar;
