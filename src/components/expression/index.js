import React, { Component } from 'react'
import { Button } from 'semantic-ui-react'
import Tsne from './Tsne'
import Violin from './Violin'
import SearchFeatures from './SearchFeatures'

export default class Expression extends Component{
    constructor(props){
        super(props);
        this.state = {
            runID : props.parentcurrentRunId,
            selectedFeature : '',
            loading : false,
            showTsne : true, // toggle this
        }
    }

    togglePlot = () => {
        this.setState({showTsne: !this.state.showTsne});
    }

    updateFeature = (newFeature, isLoading) => {
        this.setState({selectedFeature: newFeature, loading: isLoading});
    }

    changeLoading = (isLoading) => {
        this.setState({loading: isLoading})
    }

    render() {
        let {runID, selectedFeature, loading, showTsne} = this.state;
        let plot, hidden, shown

        if (showTsne == true){
            hidden = 'Show Violin';
            shown = 't-SNE';
            plot = <Tsne callbackFromParent={this.changeLoading} selectedFeature={ selectedFeature } runID={ runID }></Tsne>
        }
        else{
            hidden = 'Show t-SNE';
            shown = 'Violin';
            plot = <Violin callbackFromParent={this.changeLoading} selectedFeature={ selectedFeature } runID={ runID }></Violin>
        }
        return (
            <div>
                <Button size='large' animated='vertical' onClick={this.togglePlot}>
                    <Button.Content hidden>{hidden}</Button.Content>
                    <Button.Content visible>{shown}</Button.Content>
                </Button>
                {plot}
                <SearchFeatures runID={ runID } loading={ loading } callbackFromParent={this.updateFeature}></SearchFeatures>
            </div>
        )
    }
}