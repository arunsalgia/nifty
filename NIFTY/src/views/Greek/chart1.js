import React, { useState } from "react";

import { Line } from "react-chartjs-2";
import * as zoom from "chartjs-plugin-zoom";
import Hammer from "hammerjs";

import _ from "lodash";
import moment from "moment";

import "./styles.css";

const sampleData = [
  { x: "2019-02-01", y: null },
  { x: "2019-02-02", y: null },
  { x: "2019-02-03", y: null },
  { x: "2019-02-04", y: null },
  { x: "2019-02-05", y: 225 },
  { x: "2019-02-06", y: 257 },
  { x: "2019-02-07", y: 345 },
  { x: "2019-02-08", y: 315 },
  { x: "2019-02-09", y: 232 },
  { x: "2019-02-10", y: 305 },
  { x: "2019-02-11", y: 270 },
  { x: "2019-02-12", y: 670 },
  { x: "2019-02-13", y: 232 },
  { x: "2019-02-14", y: 305 },
  { x: "2019-02-15", y: 270 },
  { x: "2019-02-16", y: 370 },
  { x: "2019-02-17", y: 175 },
  { x: "2019-02-18", y: 257 },
  { x: "2019-02-19", y: null },
  { x: "2019-02-20", y: 415 },
  { x: "2019-02-21", y: 125 },
  { x: "2019-02-22", y: 270 },
  { x: "2019-02-23", y: 370 },
  { x: "2019-02-24", y: 192 },
  { x: "2019-02-25", y: 305 },
  { x: "2019-02-26", y: 390 },
  { x: "2019-02-27", y: 370 },
  { x: "2019-02-28", y: 325 }
];

const sampleData2 = [
  { x: "2019-01-01", y: 185 },
  { x: "2019-01-02", y: 257 },
  { x: "2019-01-03", y: 345 },
  { x: "2019-01-04", y: 215 },
  { x: "2019-01-05", y: 225 },
  { x: "2019-01-06", y: 257 },
  { x: "2019-01-07", y: 345 },
  { x: "2019-01-08", y: 315 },
  { x: "2019-01-09", y: 232 },
  { x: "2019-01-10", y: 305 },
  { x: "2019-01-11", y: 270 },
  { x: "2019-01-12", y: 270 },
  { x: "2019-01-13", y: 232 },
  { x: "2019-01-14", y: 305 },
  { x: "2019-01-15", y: 270 },
  { x: "2019-01-16", y: 370 },
  { x: "2019-01-17", y: 175 },
  { x: "2019-01-18", y: 257 },
  { x: "2019-01-19", y: 245 },
  { x: "2019-01-20", y: 415 },
  { x: "2019-01-21", y: 125 },
  { x: "2019-01-22", y: 270 },
  { x: "2019-01-23", y: 370 },
  { x: "2019-01-24", y: 192 },
  { x: "2019-01-25", y: 305 },
  { x: "2019-01-26", y: 390 },
  { x: "2019-01-27", y: 370 },
  { x: "2019-01-28", y: null },
  { x: "2019-01-29", y: null },
  { x: "2019-01-30", y: null },
  { x: "2019-01-31", y: null }
];

const initialDataOptions = {
  datasets: [
    {
      label: "Profit",
      borderColor: "#F6AA2C",
      spanGaps: true,
      lineTension: 0,
      fill: false,
      borderJoinStyle: "star"
    }
  ]
};

const initialOptions = {
  responsive: true,
  maintainAspectRatio: false,
  title: {
    display: false
  },
  legend: {
    display: true
  },
  tooltips: {
    enabled: true
  },
  scales: {
    xAxes: [
      {
        type: "time",
        time: {
          unit: "day",
          displayFormats: {
            day: "YYYY/MM/DD"
          }
        },
        ticks: {
          source: "labels",
          fontSize: 13,
          callback: (value, index, values) => {
            const date = moment(value);
            // return [date.format("M/DD"), date.format("(ddd)")];
            return [date.format("DD/MM")];
          }
        },
        gridLines: {
          display: true,
        }
      }
    ],
    yAxes: [
      {
        position: "right",
        // type: "time",
      },
    //   {
    //     position: "left",
    //     beginAtZero: false,
    //   }
    ]
  },
  animation: {
    duration: 0
  },
  pan: {
    enabled: true,
    mode: "x",
    speed: 10,
    threshold: 10,
    rangeMin: {
      x: null,
      y: null
    },
    rangeMax: {
      x: null,
      y: null
    }
  },
  zoom: {
    enabled: true,
    mode: ""
  }
};

export default function AnkitZoom() {
  const [state, setState] = useState({
    data: sampleData,
    currentPosition: moment("2019-02-15").valueOf(),
    domain: [0, 100]
  });

  function addData() {
    let x = state;
    x.data = sampleData2.concat(sampleData)
    setState(x);
  }

  function getDataOptions() {
    let myData  = state;
    const dataOptions = initialDataOptions;

    dataOptions.labels = _.map(myData.data, (item) => item.x);
    dataOptions.datasets[0].data = myData.data;
    return dataOptions;
  }

  function getOptions() {
    const myData = state;
    const options = initialOptions;
    // console.log(state);

    if (myData.data.length) {
      options.scales.xAxes[0].time.max = myData.currentPosition;
      options.scales.xAxes[0].time.min = moment(myData.currentPosition)
        .subtract(7, "days")
        .valueOf();
      options.pan.rangeMin.x = moment(myData.data[0].x).valueOf();
      options.pan.rangeMax.x = moment(myData.data[myData.data.length - 1].x).valueOf();
      options.pan.onPan = ({ chart }) => {
        myData.currentPosition = chart.scales["x-axis-0"].max;
        myData.currentPositionMin = chart.scales["x-axis-0"].min;

        myData.currentData = _.filter(myData.data, (item) => {
          const date = moment(item.x);
          return (
            date.isAfter(myData.currentPositionMin) && date.isBefore(myData.currentPosition)
          );
        });
        const min = _.minBy(myData.currentData, "y").y;
        const max = _.maxBy(myData.currentData, "y").y;
        // console.log(min, max);
        // console.log(max);
        // setState({ domain: [min, max], currentPosition });
        setState(myData);
      };
    }

    return options;
  }

//   render() {
    const options = getOptions();
    const dataOptions = getDataOptions();

    return (
      <div style={{ width: "100%", height: "50vh" }}>
        <Line data={dataOptions} options={options} />
        <p onClick={addData}>ADD DATA</p>
      </div>
    );
}
// }


