import React from "react";

import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import * as R from "ramda";

import { queryIsNotNil } from "../../../utils";

import { Card } from "semantic-ui-react";

import withRedux from "../../../redux/hoc";

import ProjectCard from "./ProjectCard";

const PublicProjectsList = withRedux(() => {
    // GQL query to find all public projects
    const { data } = useQuery(
        gql`
            query {
                curatedProjects {
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
            fetchPolicy: "cache-and-network"
        }
    );
    const curatedProjects = R.ifElse(queryIsNotNil("curatedProjects"), R.prop("curatedProjects"), R.always([]))(data);
    return (
        <Card.Group itemsPerRow={3} style={{ maxHeight: "65vh", overflowY: "scroll" }}>
            {R.addIndex(R.map)(
                (project, index) => (
                    <ProjectCard key={index} {...{ project }} />
                ),
                curatedProjects
            )}
        </Card.Group>
    );
});

export default PublicProjectsList;
