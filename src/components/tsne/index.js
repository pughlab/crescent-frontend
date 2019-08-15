import React, { Component} from 'react'
import { Dropdown, Label, Grid, Button, Loader }  from 'semantic-ui-react'
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
            value: [],
            message: '',
            opacLoading: false,
            violinLoading: false
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
        if (selectedOption){
            this.setState(state => {
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
            .then(console.log(this.state))
        }
    }

    handleApply = () => {
        this.setState({opacLoading: true})
        const {runID, selectedOptions} = this.state;
        if (selectedOptions.length != 0){
            // only use the first
            let first = String(selectedOptions[0]['text']);
            fetch(`/opacity/${runID}/${first}`)
            .then(resp => resp.json())
            .then(clusters => {
                console.log(clusters);
                if (clusters.length > 0) {
                this.setState({clusters, opacLoading: false, message: ''});
                this.render();
                }
                else{
                    console.log("Caught");
                    this.setState({message: 'No Gene Expression, Graph Not Updated', opacLoading: false});
                    this.render();
                }
        })
        }
    }

    handleExpression = () => {
        this.setState({violinLoading: true});
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

        const {clusters, searchQuery, searchOptions, selectedOptions, value, message, opacLoading, violinLoading} = this.state;
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
                    <Grid.Column width={2}/>
                    <Grid.Column width={6}>                    
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
                    <p style={{paddingLeft: 10, color: 'red'}}>{message}</p>
                    </Grid.Column>
                    <Grid.Column width={6}>
                        <Button color='#5626bf' size='small' loading={opacLoading} onClick={this.handleApply}>Change Opacity</Button>
                        <Button color='#5626bf' size='small' loading={violinLoading} onClick={this.handleExpression}>View Expression</Button>
                    </Grid.Column>
                    <Grid.Column width={2}/>
                </Grid.Row>
            </Grid>
            </div>
        )
    }
}
