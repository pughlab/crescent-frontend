import * as R from "ramda";
import * as RA from "ramda-adjunct";
import React, { useState, useEffect } from "react";

import { Input, Button, Modal } from "semantic-ui-react";

import { useMutation } from "@apollo/react-hooks";
import { gql } from "apollo-boost";

// Button with method to call WAMP RPC (not pure)
// Modal for entering the run id name
const SubmitButton = ({
    params,

    setLoading,
    loading,
    setSubmitted,
    submitted,

    notUploaded,

    currentProjectID
}) => {
    const [runName, setRunName] = useState("");
    const [openRunModal, setOpenRunModal] = useState(false);
    // GraphQL mutation hook to call mutation and use result
    const [createRun, { loading: createRunLoading, data, error }] = useMutation(
        gql`
            mutation SubmitRun($name: String!, $params: String!, $projectID: ID!) {
                createRun(name: $name, params: $params, projectID: $projectID) {
                    runID
                    name
                    params
                }
            }
        `,
        { variables: { name: runName, params, projectID: currentProjectID } }
    );
    useEffect(() => {
        if (createRunLoading) {
            setLoading(true);
            setSubmitted(true);
            setOpenRunModal(false);
        }
    }, [createRunLoading, setLoading, setSubmitted]);
    useEffect(() => {
        if (R.both(RA.isNotNilOrEmpty, R.propSatisfies(RA.isNotNil, "createRun"))(data)) {
            setLoading(true);
            setSubmitted(true);
        }
    }, [data, setLoading, setSubmitted]);
    return (
        <Modal
            size="small"
            open={openRunModal}
            trigger={
                <Button
                    content="Submit"
                    icon="cloud upload"
                    labelPosition="right"
                    color="blue"
                    disabled={submitted || loading || notUploaded}
                    onClick={() => setOpenRunModal(true)}
                />
            }
        >
            <Modal.Header>Submit Run</Modal.Header>
            <Modal.Content>
                <Input
                    fluid
                    placeholder="Enter a Run Name"
                    onChange={(e, { value }) => {
                        setRunName(value);
                    }}
                />
            </Modal.Content>
            <Modal.Actions>
                <Button content="Close" onClick={() => setOpenRunModal(false)} />
                <Button primary content="Submit" onClick={() => createRun()} />
            </Modal.Actions>
        </Modal>
    );
};

export default SubmitButton;
