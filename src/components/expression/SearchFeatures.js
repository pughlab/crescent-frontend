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
            loading: props.loading
        }
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
            fetch(`/search/features/${searchQuery}`)
            .then(resp => resp.clone().json())
            .then(searchOptions => {this.setState({searchOptions})})
        }
    }

    handleApply = () => {
        //this.setState({loading: true})
        const selectedOptions = this.state.selectedOptions;
        let firstSelection = String(selectedOptions[0]['text']);
        this.props.callbackFromParent(firstSelection, true);
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
        let {searchQuery, searchOptions, selectedOptions, value, message, loading } = this.state;
        
        console.log(loading)
        return (
            <Grid>    
                <Grid.Row >                
                    <Grid.Column width={2}/>
                    <Grid.Column width={6}>                    
                    <Dropdown
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
                    <Grid.Column width={6}>
                        <Button size='small' loading={loading} onClick={this.handleApply}>View Expression</Button>
                    </Grid.Column>
                    <Grid.Column width={2}/>
                </Grid.Row>
            </Grid>
        )
    }
}
