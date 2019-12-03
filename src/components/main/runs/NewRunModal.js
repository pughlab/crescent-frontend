import React, { useState } from "react";

import { Header, Form, Button, Modal, Icon } from "semantic-ui-react";

import withRedux from "../../../redux/hoc";

import { useMutation } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
// import { queryIsNotNil } from "../../../utils";

const NewRunModal = withRedux(
    ({
        app: {
            user: { userID },
            project: { projectID }
        },
        actions: { setRun },
        refetch
    }) => {
        const [runName, setRunName] = useState("");
        const [createUnsubmittedRun] = useMutation(
            gql`
                mutation CreateUnsubmittedRun($name: String!, $projectID: ID!, $userID: ID!) {
                    createUnsubmittedRun(name: $name, projectID: $projectID, userID: $userID) {
                        runID
                        params
                        name
                    }
                }
            `,
            {
                variables: { name: runName, projectID, userID },
                // Refetch runs on new created
                onCompleted: ({ createUnsubmittedRun: newRun }) => {
                    refetch();
                    setRun(newRun);
                }
            }
        );
        return (
            <Modal
                trigger={
                    <Button fluid attached="top" color="black" animated="vertical">
                        <Button.Content visible>
                            <Icon name="add" />
                        </Button.Content>
                        <Button.Content
                            hidden
                            content="Configure a pipeline and submit a run to the cloud using this project's uploaded data"
                        />
                    </Button>
                }
            >
                <Modal.Header as={Header} textAlign="center" content="New Run" />
                <Modal.Content>
                    <Form>
                        <Form.Input
                            fluid
                            placeholder="Enter a Run Name"
                            onChange={(e, { value }) => {
                                setRunName(value);
                            }}
                        />
                        <Form.Button fluid content="Create new run" onClick={() => createUnsubmittedRun()} />
                    </Form>
                </Modal.Content>
            </Modal>
        );
    }
);

export default NewRunModal;
