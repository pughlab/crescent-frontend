import React from "react";

import { Transition, Segment, Card, Header, Button, Modal, Label, Icon } from "semantic-ui-react";

import * as R from "ramda";
import * as RA from "ramda-adjunct";

import withRedux from "../../../redux/hoc";

import Marquee from "react-marquee";
import moment from "moment";

import { useMutation } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
// import { queryIsNotNil } from "../../../utils";

const RunCard = withRedux(
    ({
        // Redux actions
        actions: { setRun },
        // Prop
        run,
        refetch //refetchs all project runs
    }) => {
        const {
            runID,
            createdOn,
            name,
            params,
            createdBy: { name: creatorName },
            completed
        } = run;
        const [deleteRun] = useMutation(
            gql`
                mutation DeleteRun($runID: ID!) {
                    deleteRun(runID: $runID) {
                        runID
                    }
                }
            `,
            {
                variables: { runID },
                onCompleted: data => refetch()
            }
        );
        return (
            <Transition visible animation="fade down" duration={500} unmountOnHide={true} transitionOnMount={true}>
                <Card color={completed ? "green" : "yellow"}>
                    <Card.Content>
                        <Label
                            attached="top"
                            // Color based on whether run is complete or not
                            color={completed ? "green" : "yellow"}
                        >
                            <Icon
                                name="file"
                                // name={completed ? 'file' : 'spinner'}
                                // loading={R.not(completed)}
                                size="large"
                                style={{ margin: 0 }}
                            />
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
                    <Card.Content>
                        <Button.Group widths={2}>
                            <Modal
                                trigger={
                                    <Button basic fluid animated="vertical">
                                        <Button.Content visible>
                                            <Icon name="sliders horizontal" />
                                        </Button.Content>
                                        <Button.Content hidden content="Parameters" />
                                    </Button>
                                }
                            >
                                <Modal.Header as={Header} textAlign="center" content="Run Parameters" />
                                <Modal.Content>
                                    {RA.isNotNil(params) &&
                                        R.compose(
                                            ({
                                                singleCell,
                                                numberGenes: { min: minNumberGenes, max: maxNumberGenes },
                                                percentMito: { min: minPercentMito, max: maxPercentMito },
                                                resolution,
                                                principalDimensions
                                            }) => (
                                                <Label.Group>
                                                    <Label content="Single Cell Input Type" detail={singleCell} />
                                                    <Label
                                                        content="Number of Genes"
                                                        detail={`Min = ${minNumberGenes} | Max = ${maxNumberGenes}`}
                                                    />
                                                    <Label
                                                        content="Mitochondrial Fraction"
                                                        detail={`Min = ${minPercentMito} | Max = ${maxPercentMito}`}
                                                    />
                                                    <Label content="Clustering Resolution" detail={resolution} />
                                                    <Label content="PCA Dimensions" detail={principalDimensions} />
                                                </Label.Group>
                                            ),
                                            JSON.parse
                                        )(params)}
                                </Modal.Content>
                            </Modal>

                            <Modal
                                basic
                                size="small"
                                trigger={
                                    <Button basic fluid animated="vertical">
                                        <Button.Content visible>
                                            <Icon name="trash" />
                                        </Button.Content>
                                        <Button.Content hidden content="Delete" />
                                    </Button>
                                }
                            >
                                <Modal.Content>
                                    <Segment attached="top">
                                        <Header
                                            icon="trash"
                                            content={name}
                                            subheader="Are you sure you want to delete this run?"
                                        />
                                    </Segment>
                                    <Segment attached="bottom">
                                        <Button fluid color="red" inverted onClick={() => deleteRun()}>
                                            <Icon name="checkmark" />
                                            Yes, delete this run
                                        </Button>
                                    </Segment>
                                </Modal.Content>
                            </Modal>
                        </Button.Group>
                    </Card.Content>
                    <Card.Content>
                        <Button basic fluid animated="vertical" onClick={() => setRun(run)}>
                            <Button.Content visible>
                                <Icon name="eye" />
                            </Button.Content>
                            <Button.Content hidden content="View" />
                        </Button>
                    </Card.Content>
                </Card>
            </Transition>
        );
    }
);

export default RunCard;
