import React, { useState } from "react";

import { useMutation } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import * as R from "ramda";
import * as RA from "ramda-adjunct";

import { queryIsNotNil } from "../../../utils";

import { Form, Header, Button, Modal, Icon } from "semantic-ui-react";

import withRedux from "../../../redux/hoc";

const UploadButton = ({
    label,
    url, // Express url to upload temporary file
    setUploadedFile
}) => {
    const [localUploadedFile, setLocalUploadedFile] = useState(null);
    return (
        <>
            <Button
                fluid
                icon="upload"
                color={R.isNil(localUploadedFile) ? undefined : "blue"}
                active={RA.isNotNil(localUploadedFile)}
                content={R.isNil(localUploadedFile) ? label : localUploadedFile.name}
                as={"label"}
                htmlFor={label}
            />
            <input
                hidden
                id={label}
                type="file"
                onChange={event => {
                    const file = R.head(event.target.files);
                    // Send file to minio
                    const xhr = new XMLHttpRequest();
                    xhr.open("PUT", url, true);
                    // xhr.setRequestHeader('Access-Control-Allow-Origin', '*')
                    xhr.withCredentials = true;
                    const formData = new FormData();
                    formData.append("uploadedFile", file);
                    xhr.send(formData);
                    // xhr.onprogress = () => {}
                    xhr.onload = () => {
                        if (xhr.status === 200) {
                            const uploadID = xhr.response;
                            setUploadedFile(uploadID);
                            setLocalUploadedFile(file);
                        }
                    };
                    // console.log(event.target.files)
                }}
            />
        </>
    );
};

const NewProjectModal = withRedux(
    ({
        app: {
            user: { userID }
        },
        actions: { setProject },

        refetch
    }) => {
        const [name, setName] = useState("");
        const [description, setDescription] = useState("");
        // Minio object names for uploaded files in temporary bucket
        const [uploadedBarcodesFile, setUploadedBarcodesFile] = useState(null);
        const [uploadedGenesFile, setUploadedGenesFile] = useState(null);
        const [uploadedMatrixFile, setUploadedMatrixFile] = useState(null);
        console.log(uploadedBarcodesFile, uploadedGenesFile, uploadedMatrixFile);
        // GQL mutation to create a project
        const [createProject, { data }] = useMutation(
            gql`
                mutation CreateProject(
                    $userID: ID!
                    $name: String!
                    $description: String!
                    $barcodesObjectName: ID!
                    $genesObjectName: ID!
                    $matrixObjectName: ID!
                ) {
                    createProject(
                        userID: $userID
                        name: $name
                        description: $description
                        barcodesObjectName: $barcodesObjectName
                        genesObjectName: $genesObjectName
                        matrixObjectName: $matrixObjectName
                    ) {
                        projectID
                        name
                        description
                        createdOn
                        createdBy {
                            name
                        }
                        runs {
                            runID
                            name
                            params
                        }
                    }
                }
            `,
            {
                variables: {
                    userID,
                    name,
                    description,
                    barcodesObjectName: uploadedBarcodesFile,
                    genesObjectName: uploadedGenesFile,
                    matrixObjectName: uploadedMatrixFile
                },
                onCompleted: data => refetch()
            }
        );
        const disableSubmit = R.any(RA.isNilOrEmpty)([
            name,
            description,
            uploadedBarcodesFile,
            uploadedGenesFile,
            uploadedMatrixFile
        ]);
        return (
            <Modal
                trigger={
                    <Button fluid attached="top" color="black" animated="vertical">
                        <Button.Content visible>
                            <Icon name="add" />
                        </Button.Content>
                        <Button.Content hidden content="Upload your own files to create a new project" />
                    </Button>
                }
            >
                <Modal.Header as={Header} textAlign="center" content="New Uploaded Project" />
                <Modal.Content>
                    {R.ifElse(
                        queryIsNotNil("createProject"),
                        R.always(
                            <Header icon textAlign="center">
                                <Icon name="check" />
                                Project created! Click away to close
                            </Header>
                        ),
                        R.always(
                            <Form>
                                <Form.Input
                                    fluid
                                    placeholder="Enter a project name"
                                    onChange={(e, { value }) => {
                                        setName(value);
                                    }}
                                />
                                <Form.TextArea
                                    placeholder="Enter a short project description"
                                    onChange={(e, { value }) => {
                                        setDescription(value);
                                    }}
                                />
                                <Form.Group widths={3}>
                                    <Form.Field>
                                        <UploadButton
                                            label="Barcodes"
                                            url="/upload/barcodes"
                                            setUploadedFile={setUploadedBarcodesFile}
                                        />
                                    </Form.Field>
                                    <Form.Field>
                                        <UploadButton
                                            label="Genes/Features"
                                            url="/upload/genes"
                                            setUploadedFile={setUploadedGenesFile}
                                        />
                                    </Form.Field>
                                    <Form.Field>
                                        <UploadButton
                                            label="Matrix"
                                            url="/upload/matrix"
                                            setUploadedFile={setUploadedMatrixFile}
                                        />
                                    </Form.Field>
                                </Form.Group>

                                <Form.Button
                                    fluid
                                    content="Create new project"
                                    disabled={disableSubmit}
                                    onClick={() => createProject()}
                                />
                            </Form>
                        )
                    )(data)}
                </Modal.Content>
            </Modal>
        );
    }
);

export default NewProjectModal;
