import React, { Component } from 'react'
import { Grid, Header } from 'semantic-ui-react'
import Plot from 'react-plotly.js'
import { expression } from '@babel/template';


export default class Violin extends Component{
    constructor(props){
        super(props);
        this.state = {
            runID : props.runID,
            selectedFeature : props.selectedFeature,
            hidden: props.hidden,
            group: props.group,
            expressionData : [],
            message: '',
            cellcount: props.cellcount
        }
    }

    fetchData = () => {
        
        if (this.state.cellcount > 10000){
            this.setState({message: 'Currently interactive violin plots are only supported for datasets with < 10k cells'})
        }
        else if (this.state.selectedFeature){
            if (! this.state.group){
                fetch(`/expression/${this.state.runID}/${this.state.selectedFeature}`)
                .then(resp => resp.json(resp))
                .then(data => {
                    if (data.length > 0){
                        this.setState({expressionData: data, message: 'Expression for ' + String(this.state.selectedFeature)});
                    }
                    else {
                        this.setState({expressionData: data, message: 'No Expression for '+ String(this.state.selectedFeature)});
                    }
                    this.render();
                    this.props.callbackFromParent(false);
                })

            }
            else {
                fetch(`/expressiongroup/${this.state.runID}/${this.state.selectedFeature}/${this.state.group}`)
                .then(resp => resp.json(resp))
                .then(data => {
                    if (data.length > 0){
                        this.setState({expressionData: data, message: 'Expression for ' + String(this.state.selectedFeature)});
                    }
                    else {
                        this.setState({expressionData: data, message: 'No Expression for '+ String(this.state.selectedFeature)});
                    }
                    this.render();
                    this.props.callbackFromParent(false);
                })
            }
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
        if (props.group != state.group){
            update.group = props.group;
        }
        if (props.cellcount != state.cellcount){
            update.cellcount = props.cellcount;
        }

        // return the updated state or null if no change
        return Object.keys(update).length ? update : null;
    }

    componentDidUpdate(prevProps, prevState) {
        if((prevState.selectedFeature != this.state.selectedFeature) || (prevState.runID != this.state.runID) || (prevState.group != this.state.group)){
            this.fetchData();
        }
    }

    render() {
        let {expressionData, message, hidden, group} = this.state;
        let plotDisplay;

        if (hidden == true){
            plotDisplay = 'none';
        }
        else{
            plotDisplay = 'inline-block';
        }

        let xlabel = (group) ? group : 'Clusters'
        console.log(expressionData)
        console.log(group)

        return (
            <div hidden={hidden} style={{display: plotDisplay}}>
                <Plot
                    useResizeHandler={true}
                    data={expressionData}
                    layout={{
                        title: message, 
                        titlefont: {family: "Lato,sans-serif"}, 
                        yaxis:{zeroline: false, title: 'Normalized Expression'}, 
                        xaxis:{tickmode: 'linear', title: {xlabel}},
                        hovermode: 'closest'
                    }}
                />
            </div>
        )

    }
}
