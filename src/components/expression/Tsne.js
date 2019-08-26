import React, { Component } from 'react'
import Plot from 'react-plotly.js'


export default class Tsne extends Component{
    constructor(props){
        super(props);
        this.state = {
            runID : props.runID,
            selectedFeature : props.selectedFeature,
            hidden: props.hidden,
            clusters : [],
            message: '',
            plotting: false
        }
    }

    fetchData = () => {
        let {runID, selectedFeature} = this.state;

        if (selectedFeature == ''){
            fetch(`/tsne/${runID}`)
            .then(resp => resp.json())
            .then(data => {this.setState({clusters: data, message: ''})});
        }
        else{
            // fetch the clusters with variable opacities
            fetch(`/opacity/${runID}/${selectedFeature}`)
            .then(resp => resp.json())
            .then(data => {
                if (data.length > 0){
                    this.setState({clusters: data, message: ''});
                    this.render();
                    this.props.callbackFromParent(false);
                }
                else{
                    this.setState({message: 'No gene expression data available - graph not updated'});
                    this.render();
                    this.props.callbackFromParent(false);
                }
            });
        }
    }

    componentDidMount() {
        this.fetchData()
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
        let { clusters, message, hidden } = this.state;
        let plotDisplay;

        if (hidden == true){
            plotDisplay = 'none';
        }
        else{
            plotDisplay = 'inline-block';
        }
        return (
            <div hidden={hidden} style={{display: plotDisplay}}>
                <Plot 
                data={clusters}
                layout={{title: 't-SNE', autosize: false}}
                useResizeHandler={false}
                //style={{width:'100%', height: '90%'}}
                {...this.props}
                />
                <p>{message}</p>
            </div>
        )
    }
}
