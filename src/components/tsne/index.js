
import React, { Component} from 'react'
import Plot from 'react-plotly.js'

export default class TsnePlot extends Component {
    constructor(props){
        super(props);
        this.state = { clusters : [], hovered: ''}
    }

    componentDidMount() {
        fetch("/tsne")
        //fetch("http://localhost:4001/tsne")
        .then(resp => resp.json())
        .then(data => {this.setState({clusters: data})})
    }
    displaySelected = (elem) => {
        let xCoord = elem.points[0].x;
        let yCoord = elem.points[0].y;
        let coordString = "("+String(Number(xCoord.toFixed(2)))+","+String(Number(yCoord.toFixed(2)))+")";
        this.setState({hovered: coordString})
    }

    zoomToSelection = (elem) => {
        console.log('triggering!');
    }

    render() {
        const clusters = this.state.clusters;
        const hovered = this.state.hovered;

        return (
            //<div>
            <Plot
            data={clusters}
            layout={{title:'t-SNE', autosize: true}}
            useResizeHandler={true}
           // style={{maxWidth: '700px'}}
            //style={{width: '100%'}}
            style={{width:'100%', height: '90%'}}
            //onHover={this.displaySelected}
            {...this.props}
            />
            //<p style={{color: 'black'}}>{hovered}</p>
            //</div>
        )
    }
}
