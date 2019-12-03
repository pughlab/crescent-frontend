import React from "react";

import { Button, Header, Icon, Modal, Segment } from "semantic-ui-react";

import withRedux from "../../../redux/hoc";

import { useMutation } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
// import { queryIsNotNil } from "../../../utils";

const ArchiveProjectModal = withRedux(
    ({
        app: {
            user,
            project: { projectID, name: projectName }
        },
        actions: { setUser }
    }) => {
        const [archiveProject] = useMutation(
            gql`
                mutation ArchiveProject($projectID: ID) {
                    archiveProject(projectID: $projectID) {
                        projectID
                        archived
                    }
                }
            `,
            {
                variables: { projectID },
                onCompleted: data => {
                    console.log("archived project", data);
                    setUser(user);
                }
            }
        );
        return (
            <Modal
                basic
                size="small"
                trigger={
                    <Button color="red" animated="vertical">
                        <Button.Content visible>
                            <Icon name="trash" />
                        </Button.Content>
                        <Button.Content hidden content="Delete Project" />
                    </Button>
                }
            >
                <Modal.Content>
                    <Segment attached="top">
                        <Header
                            icon="trash"
                            content={projectName}
                            subheader="Are you sure you want to delete this project?"
                        />
                    </Segment>
                    <Segment attached="bottom">
                        <Button fluid color="red" inverted onClick={() => archiveProject()}>
                            <Icon name="checkmark" />
                            Yes, delete this project
                        </Button>
                    </Segment>
                </Modal.Content>
            </Modal>
        );
    }
);

export default ArchiveProjectModal;
