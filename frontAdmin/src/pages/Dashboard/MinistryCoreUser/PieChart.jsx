import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";

const PieChart = ({ data = {}, citizensViewPermission }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (
      data.maleCustomerCount !== undefined &&
      data.femaleCustomerCount !== undefined &&
      data.othersCustomerCount !== undefined
    ) {
      const maleCustomerCount = data.maleCustomerCount || 0;
      const femaleCustomerCount = data.femaleCustomerCount || 0;
      const othersCustomerCount = data.othersCustomerCount || 0;

      const dataArray = [
        { label: "Male", count: maleCustomerCount },
        { label: "Female", count: femaleCustomerCount },
        // { label: "Others", count: othersCustomerCount },
      ];

      const totalCount = dataArray.reduce((sum, item) => sum + item.count, 0);

      const percentages =
        totalCount > 0
          ? dataArray.map((item) => Math.round((item.count / totalCount) * 100))
          : [0, 0, 0];

      setChartData({
        dataArray,
        percentages,
      });
    }
  }, [data]);

  const options = {
    chart: {
      type: "pie",
      height: "100%",
    },
    legend: {
      position: "bottom",
    },
    labels: chartData ? chartData.dataArray.map((item) => item.label) : [],
    colors: ["#405189", "#f7b84b", "#f06548"],
    tooltip: {
      y: {
        formatter: function (value, { seriesIndex }) {
          return chartData ? chartData.dataArray[seriesIndex].count : 0;
        },
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: "100%",
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  const blankOptions = {
    chart: {
      type: "pie",
      height: "100%",
    },
    labels: ["No Data"],
    colors: ["#cccccc"],
    tooltip: {
      y: {
        formatter: () => "0",
      },
    },
    legend: {
      position: "bottom",
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: "100%",
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  if (!chartData && citizensViewPermission) {
    return null;
  }

  return (
    <div style={{ maxWidth: "420px", width: "100%", height: "auto" }}>
      <ReactApexChart
        options={citizensViewPermission ? options : blankOptions}
        series={citizensViewPermission ? chartData.percentages : [100]}
        type="pie"
        height={340}
        width="100%"
      />
    </div>
  );
};

export default PieChart;
