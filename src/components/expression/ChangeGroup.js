import React, { Component } from 'react'
import { Dropdown, Grid, Label, Button } from 'semantic-ui-react'

const R = require('ramda')

export default class ChangeGroup extends Component{
    constructor(props){
        super(props);
        this.state = {
            runID : props.runID,
            options: props.options,
            selected: null
        }
    }

    handleChangeGroup = (e, {value}) => {
        if (this.state.selected !== value){
            this.setState({selected: value});
            this.props.callbackFromParent(value);
        }
    }

    render() {
        let { options } = this.state;
        let formattedOptions = [];
        options.forEach((option) =>{
            formattedOptions.push({key: option, text: option, value: option})
        })

        console.log(options);

        return (
            <Grid verticalAlign='middle' padded='vertically'>
                <Grid.Row>
                    <Grid.Column width={10}/>
                    <Grid.Column width={2} textAlign='right'>
                        <h5>Colour By:</h5>
                    </Grid.Column>
                    <Grid.Column width={4}> 
                        <Dropdown
                            fluid
                            selection
                            labeled
                            defaultValue={options[0]}
                            options={formattedOptions}
                            onChange={this.handleChangeGroup}
                        />
                    </Grid.Column>                    
                </Grid.Row>
            </Grid>
        )
    }
}
