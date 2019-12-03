import React, { useEffect } from "react";
import { Button, Form, Grid, Container, Segment } from "semantic-ui-react";

import { useMutation } from "@apollo/react-hooks";
import { gql } from "apollo-boost";

import { Formik } from "formik";
import * as Yup from "yup";

import * as R from "ramda";
import * as RA from "ramda-adjunct";

// See LoginForm.js for congruent comments regarding structure of component

const RegisterValidationSchema = Yup.object().shape({
    firstName: Yup.string().required("First name required"),
    lastName: Yup.string().required("Last name required"),
    email: Yup.string()
        .email("Invalid Email")
        .required("Email required"),
    emailConfirm: Yup.string()
        .oneOf([Yup.ref("email"), null], "Email mismatch")
        .required("Email confirm required"),
    password: Yup.string().required("Password required"),
    passwordConfirm: Yup.string()
        .oneOf([Yup.ref("password"), null], "Password mismatch")
        .required("Password confirm required")
});

const RegisterForm = ({ setShowLogin }) => {
    const [createUser, { loading, data, error }] = useMutation(gql`
        mutation CreateUser($firstName: String!, $lastName: String!, $email: Email!, $password: String!) {
            createUser(firstName: $firstName, lastName: $lastName, email: $email, password: $password) {
                userID
            }
        }
    `);
    useEffect(() => {
        if (RA.isNotNilOrEmpty(data) && R.has("createUser".data)) {
            setShowLogin(true);
        }
    }, [data, setShowLogin]);
    return (
        <Grid centered textAlign="center" verticalAlign="middle" columns={1}>
            <Grid.Column>
                <Formik
                    intialValues={{
                        firstName: "",
                        lastName: "",
                        email: "",
                        emailConfirm: "",
                        password: "",
                        passwordConfirm: ""
                    }}
                    onSubmit={values => {
                        const { firstName, lastName, email, password } = values;
                        console.log(values);
                        createUser({ variables: { firstName, lastName, email, password } });
                    }}
                    validationSchema={RegisterValidationSchema}
                    render={({ touched, errors, handleSubmit, handleChange, handleBlur }) => {
                        const isError = valueName =>
                            R.and(
                                R.both(R.has(valueName), R.compose(RA.isNotNil, R.prop(valueName)))(touched),
                                R.both(R.has(valueName), R.compose(RA.isNotNil, R.prop(valueName)))(errors)
                            );
                        return (
                            <Container text>
                                <Segment.Group>
                                    <Segment>
                                        <Form size="large" onSubmit={handleSubmit}>
                                            <Form.Group widths={2}>
                                                <Form.Input
                                                    fluid
                                                    iconPosition="left"
                                                    icon="user"
                                                    placeholder="First name"
                                                    error={isError("firstName")}
                                                    name="firstName"
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                />
                                                <Form.Input
                                                    fluid
                                                    iconPosition="left"
                                                    icon="user"
                                                    placeholder="Last name"
                                                    error={isError("lastName")}
                                                    name="lastName"
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                />
                                            </Form.Group>

                                            <Form.Group widths={2}>
                                                <Form.Input
                                                    fluid
                                                    icon="lock"
                                                    iconPosition="left"
                                                    placeholder="Password"
                                                    type="password"
                                                    error={isError("password")}
                                                    name="password"
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                />
                                                <Form.Input
                                                    fluid
                                                    icon="lock"
                                                    iconPosition="left"
                                                    placeholder="Confirm password"
                                                    type="password"
                                                    error={isError("passwordConfirm")}
                                                    name="passwordConfirm"
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                />
                                            </Form.Group>

                                            <Form.Group widths={2}>
                                                <Form.Input
                                                    fluid
                                                    iconPosition="left"
                                                    icon="mail"
                                                    placeholder="E-mail address"
                                                    error={isError("email")}
                                                    name="email"
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                />
                                                <Form.Input
                                                    fluid
                                                    iconPosition="left"
                                                    icon="mail"
                                                    placeholder="Confirm e-mail address"
                                                    error={isError("emailConfirm")}
                                                    name="emailConfirm"
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                />
                                            </Form.Group>

                                            <Form.Button
                                                fluid
                                                color="grey"
                                                size="large"
                                                type="submit"
                                                disabled={R.any(RA.isTrue, [
                                                    // true, // Remove when deployed, only one user for now
                                                    R.any(isError, [
                                                        "firstName",
                                                        "lastName",
                                                        "email",
                                                        "emailConfirm",
                                                        "password",
                                                        "passwordConfirm"
                                                    ]),
                                                    R.isEmpty(touched)
                                                ])}
                                                content="Register"
                                            />
                                        </Form>
                                    </Segment>
                                    <Segment>
                                        <Button
                                            animated="fade"
                                            fluid
                                            color="grey"
                                            type="button"
                                            onClick={() => setShowLogin(true)}
                                        >
                                            <Button.Content visible content="Already have an account?" />
                                            <Button.Content hidden content="Click to login" />
                                        </Button>
                                    </Segment>
                                </Segment.Group>
                            </Container>
                        );
                    }}
                />
            </Grid.Column>
        </Grid>
    );
};

export default RegisterForm;
