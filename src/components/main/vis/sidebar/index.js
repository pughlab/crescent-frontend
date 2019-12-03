import React, { useState, useEffect, useRef } from "react";

import { Segment, Button, Transition, Divider, Step, Menu, Header, Accordion, Dropdown } from "semantic-ui-react";

import * as R from "ramda";
import * as RA from "ramda-adjunct";

import withRedux from "../../../../redux/hoc";

import ResultsSidebar from "./ResultsSidebar";
import PipelineSidebar from "./PipelineSidebar";

import SubmitRunButton from "../parameters/SubmitRunButton";

const SidebarComponent = withRedux(
    ({
        app: {
            view: { sidebar: sidebarView }
        },
        actions: { toggleSidebar }
    }) => {
        const isSidebarView = R.equals(sidebarView);
        return (
            <Transition visible animation="fade left" duration={1000} unmountOnHide={true} transitionOnMount={true}>
                <Segment basic style={{ height: "100%", padding: 0 }}>
                    <Segment attached="top">
                        <Button.Group fluid widths={2}>
                            <Button
                                compact
                                content="PIPELINE"
                                color={isSidebarView("pipeline") ? "blue" : undefined}
                                active={isSidebarView("pipeline")}
                                onClick={() => toggleSidebar("pipeline")}
                            />
                            <Button
                                compact
                                content="RESULTS"
                                color={isSidebarView("results") ? "violet" : undefined}
                                active={isSidebarView("results")}
                                onClick={() => toggleSidebar("results")}
                            />
                        </Button.Group>
                    </Segment>
                    <Segment attached style={{ height: "80%", overflowY: "scroll" }}>
                        {R.cond([
                            [R.equals("pipeline"), R.always(<PipelineSidebar />)],
                            [R.equals("results"), R.always(<ResultsSidebar />)]
                        ])(sidebarView)}
                    </Segment>
                    <Segment attached="bottom">
                        {R.cond([
                            [
                                R.equals("pipeline"),
                                R.always(
                                    // <Button fluid content='SUBMIT RUN' color='blue' />
                                    <SubmitRunButton />
                                )
                            ],
                            [R.equals("results"), R.always(<Button fluid content="DOWNLOAD RESULTS" color="violet" />)]
                        ])(sidebarView)}
                    </Segment>
                </Segment>
            </Transition>
        );
    }
);

export default SidebarComponent;
