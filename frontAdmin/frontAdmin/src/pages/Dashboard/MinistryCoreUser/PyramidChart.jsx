import React from 'react';
import ReactECharts from 'echarts-for-react';

const FunnelChart = ({ departmentReportList = [], departmentsViewPermission, colorMap }) => {
  if (!Array.isArray(departmentReportList) || departmentReportList.length === 0) {
    return <div>No data available</div>;
  }

  const funnelData = departmentReportList.map((item) => ({
    name: item.departmentName || "Unknown",
    value: item.RequestAssigned || 0,
    itemStyle: {
      color: colorMap[item.departmentName]
    }
  }));

  const options = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c}',
    },
    // toolbox: {
    //   show: true,
    //   feature: {
    //     saveAsImage: { show: true }
    //   }
    // },
    series: [
      {
        name: 'Requests Assigned',
        type: 'funnel',
        left: '10%',
        top: 0,
        bottom: 0,
        width: '80%',
        min: 0,
        max: Math.max(...funnelData.map(item => item.value)),
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside',
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid',
          },
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1,
        },
        data: funnelData,
      },
    ],
  };

  return (
    <div id="chart">
      {departmentsViewPermission && (
        <ReactECharts option={options} />
      )}
    </div>
  );
};

export default FunnelChart;
