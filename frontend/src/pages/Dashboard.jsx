import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import mockData from '../constants/dashboardMockData.json';
import Navbar from './components/Navbar';

const Dashboard = () => {
  const [simulationData, setSimulationData] = useState(null);
  const [selectedVariable, setSelectedVariable] = useState('');
  const [selectedViz, setSelectedViz] = useState('bar'); // "bar" or "line"

  const { simulationId } = useParams();

  // useEffect(() => {
  //   // Simulate fetching data from an API
  //   setSimulationData(mockData);
  // }, []);

  // Actual fetch of data from API would look something like this
  useEffect(() => {
    // const simId = '1'; // or obtain this dynamically
    const simId = simulationId;
    // fetch(`/report/output?id=${simId}&log=yes`)
    fetch(`http://127.0.0.1:5000/sim/results?id=${simId}`)
      .then((response) => response.json())
      // .then((response) => {
      //   console.log(`127.0.0.1:5000/sim/results?id=${simId}`)
      //   console.log(response.headers.get('content-type'));
      //   console.log(response.json());
      //   return response.json();
      // })
      .then((data) => {
        // Assuming the API returns an array of run objects,
        // we transform it into the expected structure.
        // const simulation = {
        //   id: simId,
        //   num_runs: data.length,
        //   runs: data,
        // };
        // setSimulationData(simulation);
        setSimulationData(data);
      })
      .catch((error) => {
        console.error('Error fetching simulation data:', error);
      });
  }, []);

  if (!simulationData) {
    return <div className="p-4">Loading simulation data...</div>;
  }

  // Assume simulationData has structure: { id, num_runs, runs: [ ... ] }
  const runs = simulationData.runs || [];
  console.log('runs', runs);
  console.log('data', simulationData);

  // Function to extract unique output variable names from all runs
  const getUniqueVariableNames = (runs) => {
    const varSet = new Set();
    runs.forEach((run) => {
      run.output_variables.forEach((variable) => {
        varSet.add(variable.name);
      });
    });
    return Array.from(varSet);
  };

  const uniqueVariables = getUniqueVariableNames(runs);

  // Extract values for the selected variable from each run
  const getValuesForVariable = (variableName) => {
    return runs
      .map((run) => {
        const found = run.output_variables.find((v) => v.name === variableName);
        return found ? found.value : null;
      })
      .filter((val) => val !== null);
  };

  // If a variable is selected, get its values
  const variableValues = selectedVariable ? getValuesForVariable(selectedVariable) : [];

  // Determine if all values are numeric (to decide on chart vs. table)
  const isNumeric = variableValues.every((val) => !isNaN(Number(val)));

  // Function to compute simple statistics for numeric data
  const computeStats = (values) => {
    const nums = values.map(Number);
    if (nums.length === 0) return null;
    const sum = nums.reduce((acc, num) => acc + num, 0);
    return {
      mean: (sum / nums.length).toFixed(2),
      min: Math.min(...nums),
      max: Math.max(...nums),
    };
  };

  const stats = isNumeric ? computeStats(variableValues) : null;

  // Data preparation for number of messages chart
  const messageLabels = runs.map((_, index) => `Run ${index + 1}`);
  const messagesData = runs.map((run) => Number(run.num_messages));

  const messagesChartOption = {
    title: {
      text: 'Messages per Run',
      left: 'center',
      textStyle: { color: '#fff' },
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: messageLabels,
      axisLabel: { color: '#fff' },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#fff' },
    },
    series: [
      {
        type: 'line',
        data: messagesData,
        itemStyle: {
          color: 'rgba(39, 221, 206, 0.8)',
        },
      },
    ],
    backgroundColor: 'transparent',
  };

  // Data preparation for dynamic chart
  const chartLabels = runs.map((_, index) => `Run ${index + 1}`);
  const numericValues = isNumeric ? variableValues.map(Number) : [];

  const chartOption = {
    title: {
      text: `${selectedVariable}`,
      left: 'center',
      textStyle: { color: '#fff' },
    },
    tooltip: {},
    xAxis: {
      type: 'category',
      data: chartLabels,
      axisLabel: { color: '#fff' },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#fff' },
    },
    legend: {
      data: [selectedVariable],
      textStyle: { color: '#fff' },
      top: 30,
    },
    series: [
      {
        name: selectedVariable,
        type: selectedViz, // "bar" or "line"
        data: numericValues,
        itemStyle: {
          color: 'rgba(92, 32, 189, 0.8)',
        },
      },
    ],
  };

  return (
    <div className="p-4">
      <Navbar />
      <h1 className=" text-2xl text-white font-bold mb-4 mt-22">Simulation Dashboard</h1>
      <div className="text-white">
        <div className="p-2 bg-violet-600/5 border border-violet-400 rounded mb-4">
          <p>
            <span className="font-bold">Agents: </span>
            {/* {Array.from(new Set(runs.flatMap((run) => run.chat_log.map((msg) => msg.agent)))).join(
              ', '
            )} */}
            {Array.from(new Set(runs.flatMap((run) => run.messages.map((msg) => msg.agent)))).join(
              ', '
            )}
          </p>
          <p>
            <span className="font-bold">Total Runs:</span> {runs.length}
          </p>
        </div>
        <div className="mb-2">
          <ReactECharts option={messagesChartOption} className="h-full w-full" />
        </div>
      </div>

      {/* Controls for selecting variable and visualization type */}
      <div className="flex text-white flex-wrap items-center space-x-4 mb-4">
        <label className="flex items-center space-x-2">
          <span>Select Variable:</span>
          <select
            value={selectedVariable}
            onChange={(e) => setSelectedVariable(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="" className="text-black">
              --Select--
            </option>
            {uniqueVariables.map((variable) => (
              <option key={variable} value={variable} className="text-black">
                {variable}
              </option>
            ))}
          </select>
        </label>
        {selectedVariable && isNumeric && (
          <label className="flex items-center space-x-2">
            <span>Select Visualization Type:</span>
            <select
              value={selectedViz}
              onChange={(e) => setSelectedViz(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
            </select>
          </label>
        )}
      </div>

      {/* Main visualization area */}
      {selectedVariable ? (
        <div className="mb-8">
          <h2 className="text-xl text-white font-semibold mb-2">Variable: {selectedVariable}</h2>
          {isNumeric ? (
            <>
              <div className="mb-4 text-white space-y-1">
                <p>Mean: {stats.mean}</p>
                <p>Min: {stats.min}</p>
                <p>Max: {stats.max}</p>
              </div>
              <div>
                <ReactECharts option={chartOption} className="h-full w-full" />
              </div>
            </>
          ) : (
            <div className="overflow-x-auto">
              <h3 className="text-lg text-white items-center text-center font-bold mb-2">
                Values for {selectedVariable}
              </h3>
              <table className="min-w-full text-white border-collapse">
                <thead>
                  <tr className="bg-transparent">
                    <th className="text-white border px-4 py-2">Run</th>
                    <th className="text-white border px-4 py-2">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((run, index) => {
                    const found = run.output_variables.find((v) => v.name === selectedVariable);
                    return (
                      <tr key={index} className="even:bg-transparent odd:bg-violet-600/5">
                        <td className="text-white border px-4 py-2">{index + 1}</td>
                        <td className="border px-4 py-2">{found ? found.value : 'N/A'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <p className="text-white mb-8">Please select a variable to view its statistics.</p>
      )}

      {/* Summary cards for all variables */}
      <div>
        <h2 className="text-xl text-white font-semibold mb-4">All Variables Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {uniqueVariables.map((variable) => {
            const values = getValuesForVariable(variable);
            const numeric = values.every((val) => !isNaN(Number(val)));
            return (
              <div
                key={variable}
                className="text-white bg-violet-600/5 border border-violet-400 p-4 rounded shadow hover:shadow-md hover:shadow-violet-400"
              >
                <h3 className="font-medium text-lg mb-2">{variable}</h3>
                <p className="mb-1">Values: {values.join(', ')}</p>
                {numeric && (
                  <p className="text-sm text-gray-400">Mean: {computeStats(values).mean}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
