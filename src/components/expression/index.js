import React, { Component } from 'react'
import { Button } from 'semantic-ui-react'
import Tsne from './Tsne'
import Violin from './Violin'
import SearchFeatures from './SearchFeatures'
import ChangeGroup from './ChangeGroup'

const R = require('ramda')

export default class Expression extends Component{
    constructor(props){
        super(props);
        this.state = {
            runID : props.parentcurrentRunId,
            selectedFeature : '',
            loading : false,
            plotOptions: [{plot: 't-SNE', selected: true}, {plot: 'Violin', selected: false}],
            altGroups: null,
            selectedGroup: null,
            cellcount: null
        }
    }

    togglePlot = () => {
        this.setState({showTsne: !this.state.showTsne});
    }

    changeGroup = (newGroup) => {
        this.setState({selectedGroup: newGroup})
    }

    updateVariables = (newFeature, isLoading, plotChange) => {
        if (newFeature !== null){
        this.setState({selectedFeature: newFeature, loading: isLoading, plotOptions: plotChange});
        }
        else{
            this.setState({loading: isLoading, plotOptions: plotChange});
        }
    }

    changeLoading = (isLoading) => {
        this.setState({loading: isLoading})
    }

    hasMetadata = () => {
        if(this.state.runID !== null){
            fetch(`/metadata/${this.state.runID}`)
            .then(resp => resp.json())
            .then((data) => {
                this.setState({altGroups: data, selectedGroup: data[0]})
            })
        }
    }
    
    getCellCount = () => {
        if(this.state.runID !== null){
            fetch(`/cellcount/${this.state.runID}`)
            .then(resp => resp.json())
            .then((data) => {
                this.setState({cellcount: data})
            })
        } 
    }
    componentDidMount() {
        if(this.state.runID !== null){
            this.hasMetadata();
            this.getCellCount();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if((prevState.runID != this.state.runID)){
            this.hasMetadata();
            this.getCellCount();
        }
    }

    static getDerivedStateFromProps(props, state){
        if (props.parentcurrentRunId != state.runID){return {runID: props.parentcurrentRunId};}
        else { return null }
    }
   
    render() {
        let {runID, selectedFeature, loading, plotOptions, altGroups, selectedGroup, cellcount} = this.state;
        let groups = ''
        const hidePlot = plotType => R.compose(
            R.not,
            R.prop('selected'),
            R.find(R.propEq("plot", plotType))
         )(plotOptions)
            
        if (altGroups && altGroups.length > 0){
            groups = <ChangeGroup runID={ runID } options={ altGroups } callbackFromParent={ this.changeGroup }/>
        }
     
        return (
            <div>
                <div style={{width:'100%', height: '90%', textAlign: 'center'}} >
                    { groups }
                    <Tsne callbackFromParent={this.changeLoading} cellcount={ cellcount } selectedFeature={ selectedFeature } group={ selectedGroup } runID={ runID } hidden={hidePlot('t-SNE')}></Tsne>
                    <Violin callbackFromParent={this.changeLoading} cellcount={ cellcount }selectedFeature={ selectedFeature } group={ selectedGroup } runID={ runID } hidden={hidePlot('Violin')}></Violin>
                    <SearchFeatures plotOptions={plotOptions} runID={ runID } loading={ loading } callbackFromParent={this.updateVariables}></SearchFeatures>
                </div>
            </div>
        )
    }
}