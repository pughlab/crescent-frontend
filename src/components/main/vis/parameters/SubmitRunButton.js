import React from "react";

import { Button } from "semantic-ui-react";

import withRedux from "../../../../redux/hoc";

import { useMutation } from "@apollo/react-hooks";
import { gql } from "apollo-boost";

const SubmitRunButton = withRedux(
    ({
        app: {
            run: { runID },
            toggle: {
                vis: {
                    pipeline: { parameters }
                }
            }
        },
        actions: {}
    }) => {
        const [submitRun, { loading, data, error }] = useMutation(
            gql`
                mutation SubmitRun($runID: ID, $params: String) {
                    submitRun(runID: $runID, params: $params) {
                        runID
                    }
                }
            `,
            {
                variables: { runID, params: JSON.stringify(parameters) }
            }
        );
        return <Button fluid content="SUBMIT RUN" color="blue" onClick={() => submitRun()} />;
    }
);

export default SubmitRunButton;
