import React, { useRef, useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";

const ApexChart = ({ data, servicesViewPermission }) => {
  const chartRef = useRef(null);
  const [chartHeight, setChartHeight] = useState(340);
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        setChartHeight(chartRef.current.offsetHeight);
      }
    };

    // Use ResizeObserver to detect size changes of the chartRef element
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (chartRef.current) {
      resizeObserver.observe(chartRef.current);
    }

    // Cleanup observer on unmount
    return () => {
      if (chartRef.current) {
        resizeObserver.unobserve(chartRef.current);
      }
    };
  }, []);

  const series = servicesViewPermission ? [data?.new || 0, data?.inProgress || 0, data?.pending || 0, data?.completed || 0, data?.total || 0] : [];

  const options = {
    chart: {
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
        },
        dataLabels: {
          name: { show: false },
          value: { show: false },
        },
        barLabels: {
          enabled: true,
          floating: true,
          offsetX: -8,
          fontSize: '15px',
          fontWeight: '600',
          formatter: function (seriesName, opts) {
            return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex]
          },
        },
      },
    },
    labels: ["New", "In-Progress", "Pending", "Completed", "Total"],
    colors: ["#405189", "#f06548", "#f7b84b", "#0ab39c", "#394958"],
    responsive: [
      {
        breakpoint: 700,
        options: {
          legend: { show: false },
        },
      },
    ],
  };

  return (
    <div id="chart" ref={chartRef} style={{ height: '100%' }}>
      {servicesViewPermission ? (
        <ReactApexChart
          options={options}
          series={series}
          type="radialBar"
          height={chartHeight}  // Dynamic height
        />
      ) : (
        <div style={{ height: chartHeight, width: '100%' }} />
      )}
    </div>
  );
};

export default ApexChart;
