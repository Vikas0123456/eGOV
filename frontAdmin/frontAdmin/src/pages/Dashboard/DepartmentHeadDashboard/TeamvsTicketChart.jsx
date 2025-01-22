import React, { useRef, useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";

const TeamvsTicketChart = ({ data, ticketsViewPermission }) => {
  const chartRef = useRef(null);
  const [chartHeight, setChartHeight] = useState(300);

  const predefinedColors = ["#405189", "#f06548", "#f7b84b", "#0ab39c", "#394958"];

  const generateColorFromPredefinedList = (index) => {
    return predefinedColors[index % predefinedColors.length];
  };

  const series = data?.length > 0 ? data.map(item => item.RequestAssigned) : [1];
  const labels = data?.length > 0 ? data.map(item => item.userName) : ["No Data"];
  const colors = data?.length > 0 ? data.map((_, index) => generateColorFromPredefinedList(index)) : predefinedColors;

  const chartOptions = {
    chart: {
      type: "donut",
      width: '100%',
    },
    legend: {
      position: "bottom",
    },
    plotOptions: {
      pie: {
        startAngle: -90,
        endAngle: 90,
        offsetY: 10,
        donut: {
          labels: {
            show: false,
          },
        },
      },
    },
    labels,
    colors,
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  const blankOptions = {
    chart: {
      type: "donut",
      width: '100%',
    },
    colors: ["#cccccc"],
    labels: ["No Data"],
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        startAngle: -90,
        endAngle: 90,
        offsetY: 10,
        donut: {
          labels: {
            show: false,
          },
        },
      },
    },
    legend: {
      position: "bottom",
    },
  };

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        // console.log('Entry size:', entry.contentRect.height); // Debug log
        setChartHeight(entry.contentRect.height || 300); // Fallback to 300 if height is 0
      }
    });

    if (chartRef.current) {
      resizeObserver.observe(chartRef.current);
    }

    return () => {
      if (chartRef.current) {
        resizeObserver.unobserve(chartRef.current);
      }
    };
  }, []);

  return (
    <div ref={chartRef} style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
      <ReactApexChart
        options={ticketsViewPermission ? chartOptions : blankOptions}
        series={ticketsViewPermission ? series : [1]}
        type="donut"
        height={chartHeight}
        key={chartHeight} // Force re-render on height change
      />
    </div>
  );
};

export default TeamvsTicketChart;
