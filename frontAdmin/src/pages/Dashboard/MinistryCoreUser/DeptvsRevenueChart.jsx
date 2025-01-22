import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

const ServicevsRevenueChart = ({
  departmentVSRevenueList,
  departmentsViewPermission,
  revenueViewPermission,
}) => {
  const [chartOptions, setChartOptions] = useState({
    series: [],
    options: {
      chart: {
        type: "bar",
        height: 285,
        stacked: true,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          dataLabels: {},
        },
      },
      stroke: {
        width: 1,
        colors: ["#fff"],
      },
      colors: ["#405189"],
      xaxis: {
        categories: [],
        labels: {
          show: false,
          formatter: function (val) {
            return val;
          },
        },
      },
      yaxis: {
        title: {
          text: "$Revenue",
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
        height: 285,
      },
      xaxis: {
        categories: [],
        labels: {
          show: false,
        },
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
        departmentVSRevenueList &&
        Array.isArray(departmentVSRevenueList) &&
        departmentVSRevenueList.length > 0
      ) {
        const departments = departmentVSRevenueList.map(
          (dept) => dept.departmentName
        );
        const totalRevenues = departmentVSRevenueList.map(
          (dept) => dept.totalRevenueDepartment
        );

        setChartOptions((prevOptions) => ({
          ...prevOptions,
          series: [
            {
              name: "$Revenue",
              data: totalRevenues,
            },
          ],
          options: {
            ...prevOptions.options,
            xaxis: {
              ...prevOptions.options.xaxis,
              categories: departments,
            },
          },
        }));
      }
    } catch (error) {
      console.error(error);
    }
  }, [departmentVSRevenueList]);

  return (
    <div>
      <div id="chart">
        <ReactApexChart
          options={
            departmentsViewPermission && revenueViewPermission
              ? chartOptions.options
              : blankChartOptions.options
          }
          series={
            departmentsViewPermission && revenueViewPermission
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











// import React, { useEffect, useState } from "react";
// import ReactApexChart from "react-apexcharts";

// const ServicevsRevenueChart = ({
//   departmentVSRevenueList,
//   departmentsViewPermission,
//   revenueViewPermission,
// }) => {
//   const [chartOptions, setChartOptions] = useState({
//     series: [],
//     options: {
//       chart: {
//         type: "bar",
//         height: 285,
//         stacked: true,
//         toolbar: {
//           show: false,
//         },
//       },
//       plotOptions: {
//         bar: {
//           horizontal: false,
//           dataLabels: {},
//         },
//       },
//       stroke: {
//         width: 1,
//         colors: ["#fff"],
//       },
//       colors: ["#405189"],
//       xaxis: {
//         categories: [],
//         labels: {
//           formatter: function (val) {
//             return val;
//           },
//         },
//       },
//       yaxis: {
//         title: {
//           text: "$Revenue",
//         },
//       },
//       tooltip: {
//         y: {
//           formatter: function (val) {
//             return val;
//           },
//         },
//       },
//       fill: {
//         opacity: 1,
//       },
//       legend: {
//         position: "bottom",
//         horizontalAlign: "center",
//         offsetX: 40,
//       },
//     },
//   });

//   const [blankChartOptions, setBlankChartOptions] = useState({
//     series: [
//       {
//         name: "No Data",
//         data: [],
//       },
//     ],
//     options: {
//       chart: {
//         type: "bar",
//         height: 285,
//       },
//       xaxis: {
//         categories: [],
//       },
//       yaxis: {
//         title: {
//           text: "No Data Available",
//         },
//       },
//     },
//   });

//   useEffect(() => {
//     try {
//       if (
//         departmentVSRevenueList &&
//         Array.isArray(departmentVSRevenueList) &&
//         departmentVSRevenueList.length > 0
//       ) {
//         const departments = departmentVSRevenueList.map(
//           (dept) => dept.departmentName
//         );
//         const totalRevenues = departmentVSRevenueList.map(
//           (dept) => dept.totalRevenueDepartment
//         );

//         setChartOptions((prevOptions) => ({
//           ...prevOptions,
//           series: [
//             {
//               name: "$Revenue",
//               data: totalRevenues,
//             },
//           ],
//           options: {
//             ...prevOptions.options,
//             xaxis: {
//               categories: departments,
//             },
//           },
//         }));
//       }
//     } catch (error) {
//       console.error(error);
//     }
//   }, [departmentVSRevenueList]);

//   return (
//     <div>
//       <div id="chart">
//         <ReactApexChart
//           options={
//             departmentsViewPermission && revenueViewPermission
//               ? chartOptions.options
//               : blankChartOptions.options
//           }
//           series={
//             departmentsViewPermission && revenueViewPermission
//               ? chartOptions.series
//               : blankChartOptions.series
//           }
//           type="bar"
//           height={285}
//         />
//       </div>
//     </div>
//   );
// };

// export default ServicevsRevenueChart;