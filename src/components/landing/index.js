import React, { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import UserInfo from "./UserInfo";

import withRedux from "../../redux/hoc";
import * as RA from "ramda-adjunct";

const LandingPageComponent = withRedux(
    ({
        app: {
            // user: {projects: userProjects},
            user
        }
    }) => {
        const [showLogin, setShowLogin] = useState(true);
        return RA.isNotNil(user) ? (
            <UserInfo />
        ) : showLogin ? (
            <LoginForm {...{ setShowLogin }} />
        ) : (
            <RegisterForm {...{ setShowLogin }} />
        );
    }
);
export default LandingPageComponent;
