import React from "react";

import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import * as R from "ramda";

import { queryIsNotNil } from "../../../utils";

import { Card, Header, Icon, Segment } from "semantic-ui-react";

import withRedux from "../../../redux/hoc";

import ProjectCard from "./ProjectCard";
import NewProjectModal from "./NewProjectModal";

const UploadedProjectsList = withRedux(
    ({
        app: {
            user: { userID }
        }
    }) => {
        // GQL query to find all projects of which user is a member of
        const { data, refetch } = useQuery(
            gql`
                query UserProjects($userID: ID) {
                    projects(userID: $userID) {
                        projectID
                        name
                        description
                        createdOn
                        createdBy {
                            name
                        }
                    }
                }
            `,
            {
                fetchPolicy: "network-only",
                variables: { userID }
            }
        );
        const userProjects = R.ifElse(queryIsNotNil("projects"), R.prop("projects"), R.always([]))(data);
        console.log(data);
        return (
            <>
                <NewProjectModal {...{ refetch }} />
                <Segment attached="bottom">
                    {R.ifElse(
                        R.isEmpty,
                        R.always(
                            <Segment placeholder>
                                <Header icon>
                                    <Icon name="exclamation" />
                                    No Projects
                                </Header>
                            </Segment>
                        ),
                        userProjects => (
                            <Card.Group itemsPerRow={3}>
                                {R.addIndex(R.map)(
                                    (project, index) => (
                                        <ProjectCard key={index} {...{ project }} />
                                    ),
                                    userProjects
                                )}
                            </Card.Group>
                        )
                    )(userProjects)}
                </Segment>
            </>
        );
    }
);

export default UploadedProjectsList;
