import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

const ServicevsRevenueChart = ({
  serviceManagement,
  servicesViewPermission,
  revenueViewPermission,
}) => {
  const [chartOptions, setChartOptions] = useState({
    series: [],
    options: {
      chart: {
        type: "bar",
        height: 350,
        stacked: true,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          dataLabels: {},
        },
      },
      stroke: {
        width: 1,
        colors: ["#fff"],
      },
      colors: ["#405189", "#f7b84b"],
      xaxis: {
        categories: [],
        labels: {
          formatter: function (val) {
            return val;
          },
        },
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val;
          },
        },
      },
      fill: {
        opacity: 1,
      },
      legend: {
        position: "bottom",
        horizontalAlign: "center",
        offsetX: 40,
      },
    },
  });

  const [blankChartOptions, setBlankChartOptions] = useState({
    series: [
      {
        name: "No Data",
        data: [],
      },
    ],
    options: {
      chart: {
        type: "bar",
        height: 350,
      },
      xaxis: {
        categories: [],
      },
      yaxis: {
        title: {
          text: "No Data Available",
        },
      },
    },
  });

  useEffect(() => {
    try {
      if (
        serviceManagement &&
        Array.isArray(serviceManagement) &&
        serviceManagement.length > 0
      ) {
        const departments = serviceManagement.map((dept) => dept.serviceName);
        const serviceCounts = serviceManagement.map(
          (dept) => dept.applicationCount
        );
        const totalRevenues = serviceManagement.map(
          (dept) => dept.totalRevenueService
        );

        setChartOptions((prevOptions) => ({
          ...prevOptions,
          series: [
            {
              name: "Service",
              data: serviceCounts,
            },
            {
              name: "$Revenue",
              data: totalRevenues,
            },
          ],
          options: {
            ...prevOptions.options,
            xaxis: {
              categories: departments,
            },
          },
        }));
      }
    } catch (error) {
      console.error(error);
    }
  }, [serviceManagement]);

  return (
    <div>
      <div id="chart">
        <ReactApexChart
          options={
            servicesViewPermission && revenueViewPermission
              ? chartOptions.options
              : blankChartOptions.options
          }
          series={
            servicesViewPermission && revenueViewPermission
              ? chartOptions.series
              : blankChartOptions.series
          }
          type="bar"
          height={285}
        />
      </div>
    </div>
  );
};

export default ServicevsRevenueChart;
