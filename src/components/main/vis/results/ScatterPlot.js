import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import withRedux from "../../../../redux/hoc";
import { Loader } from "semantic-ui-react";

import * as R from "ramda";

const ScatterPlot = withRedux(
    ({
        app: {
            run: { runID },
            toggle: {
                vis: {
                    results: { activeResult, selectedFeature, selectedGroup, availablePlots }
                }
            }
        },
        actions: {
            thunks: { fetchScatter }
        }
    }) => {
        // use local state for data since too big for redux store
        const [scatterData, setScatterData] = useState([]);

        useEffect(() => {
            fetchScatter().then(data => {
                setScatterData(data);
            });
        }, [activeResult, fetchScatter]);

        useEffect(() => {
            if (selectedGroup) {
                setScatterData([]); // set to loading
                fetchScatter().then(data => {
                    setScatterData(data);
                });
            }
        }, [fetchScatter, selectedGroup]);

        useEffect(() => {
            if (!R.isNil(selectedFeature)) {
                const prev = scatterData;
                setScatterData([]); // loading
                fetchScatter().then(data => {
                    const mapIndexed = R.addIndex(R.map);
                    const merged = R.ifElse(
                        R.has("error"),
                        () => {
                            console.error(data["error"]);
                            return prev;
                        }, // show error message here
                        mapIndexed((val, index) => {
                            return R.mergeLeft(val, scatterData[index]);
                        })
                    )(data);
                    setScatterData(merged);
                });
            }
        }, [selectedFeature]);

        console.log(scatterData);
        return (
            <>
                {R.ifElse(
                    R.isEmpty,
                    R.always(<Loader size="big" active inline="centered" />),
                    R.always(
                        <Plot
                            data={scatterData}
                            useResizeHandler
                            style={{ width: "100%", height: "90%" }}
                            layout={{
                                autosize: true,
                                hovermode: "closest",
                                xaxis: { showgrid: false, ticks: "", showticklabels: false },
                                yaxis: { showgrid: false, ticks: "", showticklabels: false },
                                margin: { l: 20, r: 20, b: 20, t: 20 },
                                legend: { orientation: "h" }
                            }}
                        />
                    )
                )(scatterData)}
            </>
        );
    }
);

export default ScatterPlot;
