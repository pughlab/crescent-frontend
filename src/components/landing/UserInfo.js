import React from "react";
import { Button, Grid, Image, Segment, Container } from "semantic-ui-react";

import Logo from "./logo.jpg";

import withRedux from "../../redux/hoc";

const UserInfo = withRedux(
    ({
        app: {
            user: { name, email }
        },
        actions: { logout }
    }) => {
        // Use result of effect to navigate to portal
        return (
            <Grid textAlign="center" centered verticalAlign="middle" columns={1}>
                <Grid.Column>
                    <Container text>
                        <Segment.Group>
                            <Segment>
                                <Image centered size="small" src={Logo} />
                            </Segment>
                            <Segment>{name}</Segment>
                            <Segment>{email}</Segment>
                            <Segment>
                                <Button content="Log out" fluid onClick={() => logout()} />
                            </Segment>
                        </Segment.Group>
                    </Container>
                </Grid.Column>
            </Grid>
        );
    }
);

export default UserInfo;
