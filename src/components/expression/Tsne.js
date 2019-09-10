import React, { Component } from 'react'
import Plot from 'react-plotly.js'


export default class Tsne extends Component{
    constructor(props){
        super(props);
        this.state = {
            runID : props.runID,
            selectedFeature : props.selectedFeature,
            group: props.group,
            hidden: props.hidden,
            clusters : [],
            message: '',
            plotting: false,
            cellcount: props.cellcount
        }
    }

    fetchData = () => {
        let {runID, selectedFeature, group, cellcount} = this.state;

        if (! selectedFeature || selectedFeature == ''){
            if (group) {
                fetch(`/tsnegroups/${runID}/${group}`)
                .then(resp => resp.json())
                .then(data => {this.setState({clusters: data, message: ''})})
            }
            else{
                fetch(`/tsne/${runID}`)
                .then(resp => resp.json())
                .then(data => {this.setState({clusters: data, message: ''})});
            }
        }
        else{
            if (cellcount > 3000){
                this.setState({message: 'Currently interactive expression is only supported for datasets with < 3k cells'})
                this.render();
                this.props.callbackFromParent(false);
            }
            else if (group){
                // fetch the clusters with variable opacities
                fetch(`/opacitygroup/${runID}/${selectedFeature}/${group}`)
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
                layout={{
                    title: 't-SNE', 
                    autosize: false, 
                    hovermode: 'closest', 
                    xaxis:{showgrid: false, ticks: '', showticklabels: false}, 
                    yaxis:{showgrid: false, ticks: '', showticklabels: false}, 
                    legend: {"orientation": "h"}
                }}
                useResizeHandler={false}
                {...this.props}
                />
                <p>{message}</p>
            </div>
        )
    }
}
