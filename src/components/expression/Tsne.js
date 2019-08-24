import React, { Component } from 'react'
import Plot from 'react-plotly.js'


export default class Tsne extends Component{
    constructor(props){
        super(props);
        this.state = {
            runID : props.runID,
            selectedFeature : props.selectedFeature,
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
        if (props.selectedFeature != state.selectedFeature){
            return {selectedFeature: props.selectedFeature};
        }
        else { return null }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.selectedFeature != this.state.selectedFeature){
            this.fetchData()
        }
    }

    render() {
        let { clusters, message } = this.state;
        return (
            <div>
            <Plot 
            data={clusters}
            layout={{title: 't-SNE', autosize: true}}
            useResizeHandler={true}
            style={{width:'100%', height: '90%'}}
            {...this.props}
            />
            <p>{message}</p>
            </div>
        )
    }
}
