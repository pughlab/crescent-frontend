
import React, { Component} from 'react'
import { Dropdown, Label, Grid, Button }  from 'semantic-ui-react'
import Plot from 'react-plotly.js'

const R = require('ramda')

export default class TsnePlot extends Component {
    constructor(props){
        super(props);
        this.state = { 
            clusters : [], 
            runID: props.parentcurrentRunId, 
            searchQuery: '',
            searchOptions: [],
            selectedOptions: [],
            value: []
         }
    }

    fetchData = () => {
        let runID = String(this.state.runID);
        fetch(`/tsne/${runID}`)
        .then(resp => resp.json())
        .then(data => {this.setState({clusters: data})})
    }

    componentDidMount() {
        this.fetchData()
    }

    handleChange = (e, { searchQuery, value }) => {
        const {searchOptions} = this.state
        let selectedOption = R.find(R.propEq('value',value[value.length-1]))(searchOptions);
        this.setState(state => {
            const selectedOptions = state.selectedOptions.concat(selectedOption);
            return {
                searchQuery: '', value, selectedOptions
            }
        });
    }

    handleSearchChange = (e, {searchQuery}) => {
        this.setState({ searchQuery });
        if (searchQuery){
            fetch(`/search/features/${searchQuery}`)
            .then(resp => resp.json())
            .then(searchOptions => {this.setState({searchOptions})})
        }
    }

    handleApply = () => {
        const {runID, selectedOptions} = this.state;
        // only use the first lol
        let first = String(selectedOptions[0]['text'])
        console.log(first);
        fetch(`/norm-counts/${runID}/${first}`)
        .then(resp => resp.json())
        .then(data => console.log(data))
    }
    /* 
    static getDerivedStateFromProps(props, state) {
        console.log(props)
        console.log(state)
        if (props.parentcurrentRunId !== state.runID) {
          return {
            runID: props.parentcurrentRunId,
          };
        }
        return null;
    }

    componentDidUpdate(prevProps, prevState){
        console.log(prevState);
        console.log(this.state);
        console.log(prevProps);
        console.log(this.props.parentcurrentRunId);
        if (prevState && (this.state.runID !== this.propers.parentcurrentRunId)){
            console.log(this.state.runID)
            console.log(prevState)
            this.fetchData()
        }
    }
*/
    
    render() {
        //const clusters = this.state.clusters;

        const {clusters, searchQuery, searchOptions, selectedOptions, value} = this.state;

        return (
            <div>
            <Plot
            data={clusters}
            layout={{title:'t-SNE', autosize: true}}
            useResizeHandler={true}
            style={{width:'100%', height: '90%'}}
            {...this.props}
            />
            <Grid>            
                <Grid.Row>                
                    <Grid.Column width={12}>                    
                    <Dropdown
                        fluid
                        multiple
                        search
                        renderLabel = {({text}) => (<Label color='blue' content={text}/>)}
                        searchQuery={searchQuery}
                        selection
                        options={searchOptions.concat(selectedOptions)}
                        value={value}
                        onSearchChange={this.handleSearchChange}
                        onChange={this.handleChange}
                    />
                    </Grid.Column>
                    <Grid.Column width={4}><Button onClick={this.handleApply}>Apply</Button></Grid.Column>
                </Grid.Row>
            </Grid>
            </div>
        )
    }
}
