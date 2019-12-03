import React from "react";

import * as R from "ramda";

import { Segment, Header, Icon } from "semantic-ui-react";

import withRedux from "../../../../redux/hoc";

import ScatterPlot from "./ScatterPlot";

const ResultsComponent = withRedux(
    ({
        app: {
            toggle: {
                vis: {
                    results: { activeResult, availablePlots }
                }
            }
        }
    }) => {
        const ResultsHeader = R.ifElse(R.isNil, R.always(), R.path([activeResult, "label"]))(availablePlots);

        return (
            <>
                {R.ifElse(
                    R.isNil,
                    R.always(
                        <Segment basic placeholder style={{ height: "100%" }}>
                            <Header textAlign="center" icon>
                                <Icon name="right arrow" />
                                {"Select a visualization on the right"}
                            </Header>
                        </Segment>
                    ),
                    R.always(
                        <Segment basic style={{ height: "100%" }}>
                            <Header textAlign="center">{ResultsHeader}</Header>
                            <ScatterPlot />
                        </Segment>
                    )
                )(activeResult)}
            </>
        );
    }
);

export default ResultsComponent;
