import React from "react";

import { Range, getTrackBackground } from "react-range";

const RangeSlider = ({
    step,
    min,
    max,

    value,
    onChange
}) => {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                margin: "2em"
            }}
        >
            <Range
                values={[value]}
                step={step}
                min={min}
                max={max}
                onChange={onChange}
                renderTrack={({ props, children }) => (
                    <div
                        onMouseDown={props.onMouseDown}
                        onTouchStart={props.onTouchStart}
                        style={{
                            ...props.style,
                            height: "36px",
                            display: "flex",
                            width: "100%"
                        }}
                    >
                        <div
                            ref={props.ref}
                            style={{
                                height: "5px",
                                width: "100%",
                                borderRadius: "4px",
                                background: getTrackBackground({
                                    values: [value],
                                    colors: ["#548BF4", "#ccc"],
                                    min,
                                    max
                                }),
                                alignSelf: "center"
                            }}
                        >
                            {children}
                        </div>
                    </div>
                )}
                renderThumb={({ props, isDragged }) => (
                    <div
                        {...props}
                        style={{
                            ...props.style,
                            height: "42px",
                            width: "42px",
                            borderRadius: "4px",
                            backgroundColor: "#FFF",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            boxShadow: "0px 2px 6px #AAA"
                        }}
                    >
                        <div
                            style={{
                                height: "16px",
                                width: "5px",
                                backgroundColor: isDragged ? "#548BF4" : "#CCC"
                            }}
                        />
                    </div>
                )}
            />
            <output style={{ marginTop: "30px" }} id="output">
                {value.toFixed(2)}
            </output>
        </div>
    );
};

export default RangeSlider;
