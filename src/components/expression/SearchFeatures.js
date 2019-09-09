import React, { Component } from 'react'
import { Dropdown, Grid, Label, Button } from 'semantic-ui-react'

const R = require('ramda')

export default class SearchFeature extends Component{
    constructor(props){
        super(props);
        this.state = {
            runID : props.runID,
            searchQuery: '',
            searchOptions: [],
            selectedOptions: [],
            value: [],
            message: '',
            loading: props.loading,
            plotOptions: props.plotOptions
        }
    }

    handleChangePlot = (e, {value}) => {
        let plotOptions = this.state.plotOptions;
        plotOptions.forEach((option) => {
            if(value == option['plot']){
                option['selected'] = true;
            }
            else{
                option['selected'] = false
            }
        })
        console.log(plotOptions)
        this.props.callbackFromParent(null, this.state.loading, plotOptions);
    }

    handleChange = (e, {value}) => {
        const {searchOptions} = this.state
        let selectedOption = R.find(R.propEq('value',value[value.length-1]))(searchOptions);
        if (selectedOption){
            this.setState(() => {
                //const selectedOptions = state.selectedOptions.concat(selectedOption);
                const selectedOptions = [].concat(selectedOption)
                return {
                    searchQuery: '', value, selectedOptions
                }
            });
        }
        else{
            this.setState(() => {
                return {selectedOptions: [], searchOptions: [], value: []}
            });
        }
    }

    handleSearchChange = (e, {searchQuery}) => {
        this.setState({ searchQuery });
        if (searchQuery){
            fetch(`/search/features/${this.state.runID}/${searchQuery}`)
            .then(resp => resp.clone().json())
            .then(searchOptions => {this.setState({searchOptions})})
        }
    }

    handleApply = () => {
        //this.setState({loading: true})
        const selectedOptions = this.state.selectedOptions;
        let firstSelection;
        if (selectedOptions.length > 0){
            firstSelection = String(selectedOptions[0]['text']);
        }
        else {
        
        }
        this.props.callbackFromParent(firstSelection, true, this.state.plotOptions); 
        this.render()
    }

    static getDerivedStateFromProps(props, state){
        if (props.loading != state.loading){
            return {loading: props.loading};
        }
        else{
            return null
        }
    }

    render() {
        let {searchQuery, searchOptions, selectedOptions, value, message, loading, plotOptions } = this.state;
        let options = [];
        plotOptions.forEach((option) =>{
            options.push({key: option['plot'], text: option['plot'], value: option['plot']})
        })
       
        return (
            <Grid>    
                <Grid.Row >                
                    <Grid.Column width={3}/>
                    <Grid.Column width={2}> 
                        <Dropdown
                            fluid
                            selection
                            defaultValue={'t-SNE'}
                            options={options}
                            onChange={this.handleChangePlot}
                        />
                    </Grid.Column>
                    <Grid.Column width={6}>
                    <Dropdown 
                        placeholder='Search genes'
                        fluid
                        multiple
                        search
                        renderLabel = {({text}) => (<Label color='violet' content={text}/>)}
                        searchQuery={searchQuery}
                        selection
                        options={searchOptions.concat(selectedOptions)}
                        value={value}
                        onSearchChange={this.handleSearchChange}
                        onChange={this.handleChange}
                    />
                    <p style={{paddingLeft: 10, color: 'red'}}>{message}</p>
                    </Grid.Column>
                    <Grid.Column width={3}>
                        <Button size='small' loading={loading} onClick={this.handleApply}>View Expression</Button>
                    </Grid.Column>

                    <Grid.Column width={2}/>
                </Grid.Row>
            </Grid>
        )
    }
}
