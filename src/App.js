import "./App.css";
import "semantic-ui-css/semantic.min.css";
import React, { useState } from "react";

import { Segment } from "semantic-ui-react";

import MenuComponent from "./components/menu";
import MainComponent from "./components/main";

// import Logo from "./components/landing/logo.jpg";

import withRedux from "./redux/hoc";

const App = withRedux(({ session }) => {
    /* const [introduction, setIntroduction] = */ useState(true);
    return (
        // introduction ?
        // <Modal open={introduction} dimmer='inverted'>
        //   <Modal.Content>
        //     <Image src={Logo} size='medium' centered/>
        //   </Modal.Content>
        //   <Modal.Content>
        //     <Button animated='fade' fluid size='huge' color='grey' onClick={() => setIntroduction(false)}>
        //       <Button.Content visible content={'CReSCENT: CanceR Single Cell ExpressioN Toolkit'} />
        //       <Button.Content hidden content='Enter' />
        //     </Button>
        //   </Modal.Content>
        // </Modal>
        // :
        <Segment style={{ padding: 0 }}>
            <MenuComponent />
            <MainComponent {...{ session }} />
        </Segment>
    );
});
export default App;
