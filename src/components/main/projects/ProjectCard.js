import React from "react";

import moment from "moment";

import { Card, Header, Transition, Label, Icon } from "semantic-ui-react";

import withRedux from "../../../redux/hoc";

import Marquee from "react-marquee";

const ProjectCard = withRedux(
    ({
        // Redux
        actions: { setProject },
        // Prop
        project
    }) => {
        const {
            projectID,
            name,
            description,
            createdBy: { name: creatorName },
            createdOn
        } = project;
        return (
            <Transition visible animation="fade down" duration={500} unmountOnHide={true} transitionOnMount={true}>
                <Card link onClick={() => setProject(project)} color="grey">
                    <Card.Content>
                        <Label attached="top" color="grey">
                            <Icon name="folder open" size="large" style={{ margin: 0 }} />
                        </Label>
                        <Card.Header>
                            <Header size="small">
                                <Marquee text={name} />
                                <Header.Subheader>
                                    {`Created by ${creatorName} on ${moment(createdOn).format("D MMMM YYYY")}`}
                                </Header.Subheader>
                            </Header>
                        </Card.Header>
                    </Card.Content>
                    <Card.Content extra content={description} />
                </Card>
            </Transition>
        );
    }
);

export default ProjectCard;
