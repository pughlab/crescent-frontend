import React, { Component } from 'react'
import { Grid, Header } from 'semantic-ui-react'
import Plot from 'react-plotly.js'


export default class Violin extends Component{
    constructor(props){
        super(props);
        this.state = {
            runID : props.runID,
            selectedFeature : props.selectedFeature,
            hidden: props.hidden,
            expressionData : [],
            message: ''
        }
    }

    fetchData = () => {
        let runID = String(this.state.runID);
        let feature = String(this.state.selectedFeature);
        if (feature){
            fetch(`/expression/${runID}/${feature}`)
            .then(resp => resp.json(resp))
            .then(data => {
                console.log('within violin')
                console.log(data);
                if (data.length > 0){
                    this.setState({expressionData: data, message: 'Expression for ' + String(feature)});
                }
                else {
                    this.setState({expressionData: data, message: 'No Expression for '+ String(feature)});
                }
                this.render();
                this.props.callbackFromParent(false);
            })
        }
        else{
            this.setState({message: "Select a Feature"})
            this.render();
            this.props.callbackFromParent(false);
        }
    }

    componentDidMount(){
        this.fetchData();
    }

    static getDerivedStateFromProps(props, state){
        let update = {}
        if (props.selectedFeature != state.selectedFeature){
            update.selectedFeature = props.selectedFeature;
        }
        if (props.hidden != state.hidden){
            update.hidden = props.hidden;
        }
        if (props.runID != state.runID){
            update.runID = props.runID;
        }

        // return the updated state or null if no change
        return Object.keys(update).length ? update : null;
    }

    componentDidUpdate(prevProps, prevState) {
        if((prevState.selectedFeature != this.state.selectedFeature) || (prevState.runID != this.state.runID)){
            this.fetchData();
        }
    }

    render() {
        let {expressionData, message, hidden} = this.state;
        let plotDisplay;

        if (hidden == true){
            plotDisplay = 'none';
        }
        else{
            plotDisplay = 'inline-block';
        }

        return (
            <div hidden={hidden} style={{display: plotDisplay}}>
                <Header as='h3'>{message}</Header>
                <Plot
                    data={expressionData}
                    layout={{yaxis:{zeroline: false}}}
                />
            </div>
        )

    }
}
