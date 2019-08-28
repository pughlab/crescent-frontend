import React, { Component } from 'react'
import { Button } from 'semantic-ui-react'
import Tsne from './Tsne'
import Violin from './Violin'
import SearchFeatures from './SearchFeatures'

const R = require('ramda')

export default class Expression extends Component{
    constructor(props){
        super(props);
        this.state = {
            runID : props.parentcurrentRunId,
            selectedFeature : '',
            loading : false,
            showTsne : true, // toggle this
            plotOptions: [{plot: 't-SNE', selected: true}, {plot: 'Violin', selected: false}]
        }
    }

    togglePlot = () => {
        this.setState({showTsne: !this.state.showTsne});
    }

    updateVariables = (newFeature, isLoading, plotChange) => {
        if (newFeature !== null){
        this.setState({selectedFeature: newFeature, loading: isLoading, plotOptions: plotChange});
        }
        else{
            this.setState({loading: isLoading, plotOptions: plotChange});
        }
        console.log('in parent')
        console.log(this.state)
    }

    changeLoading = (isLoading) => {
        this.setState({loading: isLoading})
    }

    static getDerivedStateFromProps(props, state){
        if (props.parentcurrentRunId != state.runID){
            return {runID: props.parentcurrentRunId};
        }
        else { return null }
    }

   
    render() {
        let {runID, selectedFeature, loading, showTsne, plotOptions} = this.state;
        //let plot //, hidden, shown

        const hidePlot = plotType => R.compose(
            R.not,
            R.prop('selected'),
            R.find(R.propEq("plot", plotType))
         )(plotOptions)
        
        return (
            <div>
                <div style={{width:'100%', height: '90%', textAlign: 'center'}} >
                    <Tsne callbackFromParent={this.changeLoading} selectedFeature={ selectedFeature } runID={ runID } hidden={hidePlot('t-SNE')}></Tsne>
                    <Violin callbackFromParent={this.changeLoading} selectedFeature={ selectedFeature } runID={ runID } hidden={hidePlot('Violin')}></Violin>
                    <SearchFeatures plotOptions={plotOptions} runID={ runID } loading={ loading } callbackFromParent={this.updateVariables}></SearchFeatures>
                </div>
            </div>
        )
    }
}