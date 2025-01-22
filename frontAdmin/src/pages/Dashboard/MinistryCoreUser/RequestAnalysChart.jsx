import React from 'react';
import ReactApexChart from 'react-apexcharts';

const RequestAnalysChart = ({ data, applicationsViewPermission }) => {
  // Define default options for the chart
  const optionsCustom = {
    series: applicationsViewPermission
      ? [data?.new || 0, data?.inProgress || 0, data?.pending || 0, data?.completed || 0, data?.total || 0]
      : [], // Empty series if no permission
    options: {
      chart: {
        height: 390,
        type: "radialBar",
      },
      plotOptions: {
        radialBar: {
          offsetY: 0,
          startAngle: 0,
          endAngle: 270,
          hollow: {
            margin: 5,
            size: "30%",
            background: "transparent",
            image: undefined,
          },
          dataLabels: {
            name: {
              show: false,
            },
            value: {
              show: false,
            },
          },
          barLabels: {
            enabled: true,
            floating: true,
            offsetX: -8,
            fontSize: '15px',
            fontWeight:'600',
            formatter: function (seriesName, opts) {
              return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex]
            },
            

          },
        },
      },
      labels: ["New", "In-Progress", "Pending", "Completed", "Total"],
      colors: ["#405189", "#f06548", "#f7b84b", "#0ab39c", "#394958"],
      // legend: {
      //   show: true,
      //   floating: true,
      //   fontSize: "16px",
      //   position: "right",
      //   offsetX: 260,
      //   offsetY: 15,
      //   labels: {
      //     useSeriesColors: true,
      //   },
      //   markers: {
      //     size: 0,
      //   },
      //   formatter: function (seriesName, opts) {
      //     return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex];
      //   },
      //   itemMargin: {
      //     vertical: 3,
      //   },
      // },
      responsive: [
        {
          breakpoint: 700,
          options: {
            legend: {
              show: false,
            },
          },
        },
      ],
    },
  };

  return (
    <div>
      {applicationsViewPermission ? (
        <ReactApexChart
          options={optionsCustom.options}
          series={optionsCustom.series}
          type="radialBar"
          height={340}
        />
      ) : (
        <div style={{ height: 340, width: '100%' }} />
      )}
    </div>
  );
};

export default RequestAnalysChart;
