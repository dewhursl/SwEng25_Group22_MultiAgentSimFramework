import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import Navbar from './components/Navbar';
import api from '/src/services/apiService';

const Dashboard = () => {
  const [simulationData, setSimulationData] = useState(null);
  const [selectedVariable, setSelectedVariable] = useState('');
  const [selectedViz, setSelectedViz] = useState('bar'); // "bar" or "line"
  const [simulationId, setSimulationId] = useState('');
  const [isOpeningScreenVisible, setIsOpeningScreenVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get simulationId from URL params if available
  const params = useParams();
  const location = useLocation();

  // Detect if we should show the opening screen
  useEffect(() => {
    if (params.simulationId) {
      // If simulationId exists in URL params, use it and don't show the opening screen
      setSimulationId(params.simulationId);
      setIsOpeningScreenVisible(false);
    } else {
      // If no simulationId in URL, show the opening screen
      setIsOpeningScreenVisible(true);
      setLoading(false);
    }
  }, [params.simulationId]);

  // Fetch data from API when simulationId changes
  useEffect(() => {
    const fetchSimulationData = async () => {
      if (!simulationId) return;

      setLoading(true);
      try {
        const data = await api.getSimulationOutput(simulationId);
        setSimulationData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching simulation data:', error);
        setError('Failed to load simulation data. Please check the ID and try again.');
        setLoading(false);
      }
    };

    fetchSimulationData();
  }, [simulationId]);

  // Handle Simulation ID input change
  const handleSimulationIdChange = (event) => {
    setSimulationId(event.target.value);
  };

  // Submit simulation ID to view dashboard
  const handleViewDashboard = async () => {
    if (!simulationId) {
      setError('Simulation ID cannot be empty.');
      return;
    }

    try {
      // Check if the simulation exists
      const response = await fetch(`http://localhost:5000/sim/results?id=${simulationId}`);

      if (!response.ok) {
        throw new Error('Simulation not found.');
      }

      // If simulation exists, hide the opening screen and update URL
      setError('');
      setIsOpeningScreenVisible(false);

      // Update the URL without refreshing the page (for bookmarking purposes)
      window.history.pushState({}, '', `/dashboard/${simulationId}`);
    } catch (error) {
      setError('Simulation ID does not exist. Please check the ID and try again.');
    }
  };

  if (loading && !isOpeningScreenVisible) {
    return (
      <div className="w-full min-h-screen bg-slate-900 flex flex-col justify-center items-center">
        <Navbar />
        <div className="text-white text-xl mt-20">Loading dashboard data...</div>
      </div>
    );
  }

  // Render opening screen if no simulation ID is provided
  if (isOpeningScreenVisible) {
    return (
      <div className="w-full min-h-screen">
        <Navbar />
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="bg-violet-900/5 backdrop-blur-3xl p-10 w-96 md:w-1/2 lg:w-1/3 min-h-[300px] flex flex-col justify-center rounded-xl shadow-violet-600/60 shadow-card text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-violet-400">Enter Simulation ID</h2>
            <p className="text-lg text-gray-400 mt-4">
              Please enter a simulation ID to view the dashboard.
            </p>

            {/* Input Simulation ID */}
            <input
              type="text"
              value={simulationId}
              onChange={handleSimulationIdChange}
              placeholder="Enter Simulation ID"
              className="mt-4 mb-2 p-2 text-white border border-gray-300 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors duration-200"
            />

            {/* Error Message */}
            {error && <p className="text-red-500 mt-2">{error}</p>}

            {/* View Dashboard Button */}
            <div className="mt-4">
              <button
                onClick={handleViewDashboard}
                className="bg-violet-800 text-white px-6 py-3 rounded-full hover:shadow-button cursor-pointer"
              >
                View Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If there's no simulation data, show an error
  if (!simulationData && !loading) {
    return (
      <div className="w-full min-h-screen bg-slate-900 p-4">
        <Navbar />
        <div className="mt-20 text-red-500 text-center">
          Error loading simulation data. Please check the simulation ID and try again.
        </div>
      </div>
    );
  }

  // Assume simulationData has structure: { id, num_runs, runs: [ ... ] }
  const runs = simulationData?.runs || [];

  // Function to extract unique output variable names from all runs
  const getUniqueVariableNames = (runs) => {
    const varSet = new Set();
    runs.forEach((run) => {
      run.output_variables?.forEach((variable) => {
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
        const found = run.output_variables?.find((v) => v.name === variableName);
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
  const messagesData = runs.map((run) => Number(run.num_messages || 0));

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
    <div className="w-full min-h-screen p-4">
      <Navbar />
      <h1 className="text-2xl text-white font-bold mb-4 mt-22">Simulation Dashboard</h1>
      <div className="text-white">
        <div className="p-2 bg-violet-600/5 border border-violet-400 rounded mb-4">
          <p>
            <span className="font-bold">Simulation ID: </span>
            {simulationId}
          </p>
          <p>
            <span className="font-bold">Agents: </span>
            {Array.from(
              new Set(runs.flatMap((run) => run.messages?.map((msg) => msg.agent) || []))
            ).join(', ')}
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
            className="p-2 border rounded text-black"
          >
            <option value="">--Select--</option>
            {uniqueVariables.map((variable) => (
              <option key={variable} value={variable}>
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
              className="p-2 border rounded text-black"
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
                    const found = run.output_variables?.find((v) => v.name === selectedVariable);
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
