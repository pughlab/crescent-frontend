import React, { Component } from 'react'
import { Grid } from 'semantic-ui-react'
import Plot from 'react-plotly.js'


export default class Violin extends Component{
    constructor(props){
        super(props);
        this.state = {
            runID : props.runID,
            selectedFeature : props.selectedFeature,
            expressionData : [],
            message: ''
        }
    }

    fetchData = () => {
        let runID = String(this.state.runID);
        let feature = String(this.state.selectedFeature);
        if (feature != ''){
            fetch(`/expression/${runID}/${feature}`)
            .then(resp => resp.json(resp))
            .then(data => {
                this.setState({expressionData: data, message: ''})
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
        if (props.selectedFeature != state.selectedFeature){
            return {selectedFeature: props.selectedFeature};
        }
        else{ return null }
    }

    componentDidUpdate(prevProps, prevState) {
        if(prevState.selectedFeature != this.state.selectedFeature){
            this.fetchData();
        }
    }

    render() {
        let {expressionData, message} = this.state;

        return (
            <div>                        
                <p>{message}</p>
                <Plot
                    data={expressionData}
                    layout={{yaxis:{zeroline: false}}}
                />
            </div>
        )

    }
}
