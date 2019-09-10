import React, { Component } from 'react'
import { Button } from 'semantic-ui-react'
import Tsne from './Tsne'
import Umap from './Umap'
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
            plotOptions: [],          
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

    getPlotAvailability = (count) => {
        if(this.state.runID !== null){
            fetch(`/availablePlots/${this.state.runID}`)
            .then(resp => resp.json())
            .then((data) => {
                let plotOptions = []
                data.forEach(plotType => {
                   plotOptions.push({plot: plotType, selected: false})
                   if (plotOptions.length == 1){
                       plotOptions[0]['selected'] = true;
                   }
                })
                if (count < 15000){
                    plotOptions.push({plot: 'Violin', selected: false})
                }
                this.setState({plotOptions: plotOptions})
            })

        }
    }
    
    getCellCount = () => {
        if(this.state.runID !== null){
            fetch(`/cellcount/${this.state.runID}`)
            .then(resp => resp.json())
            .then((data) => {
                console.log(data)
                this.setState({cellcount: data})
            })
        } 
    }
    async componentDidMount() {
        if(this.state.runID !== null){
            this.hasMetadata();
            const count = await this.getCellCount();
            this.getPlotAvailability(count);
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
           
        console.log(plotOptions)
        if (altGroups && altGroups.length > 0){
            groups = <ChangeGroup runID={ runID } options={ altGroups } callbackFromParent={ this.changeGroup }/>
        }
     
        return (
            <div>
                <div style={{width:'100%', height: '90%', textAlign: 'center'}} >
                    { groups }
                    <Tsne callbackFromParent={this.changeLoading} cellcount={ cellcount } selectedFeature={ selectedFeature } group={ selectedGroup } runID={ runID } hidden={hidePlot('TSNE')}></Tsne>
                    <Umap callbackFromParent={this.changeLoading} cellcount={ cellcount } selectedFeature={ selectedFeature } group={ selectedGroup } runID={ runID } hidden={hidePlot('UMAP')}></Umap>
                    <Violin callbackFromParent={this.changeLoading} cellcount={ cellcount }selectedFeature={ selectedFeature } group={ selectedGroup } runID={ runID } hidden={hidePlot('Violin')}></Violin>
                    <SearchFeatures plotOptions={plotOptions} runID={ runID } loading={ loading } callbackFromParent={this.updateVariables}></SearchFeatures>
                </div>
            </div>
        )
    }
}