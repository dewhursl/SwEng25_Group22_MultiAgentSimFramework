import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import Navbar from './components/Navbar';
import api from '/src/services/apiService';

const Dashboard = () => {
  const [simulationData, setSimulationData] = useState(null);
  const [simulationId, setSimulationId] = useState('');
  const [isOpeningScreenVisible, setIsOpeningScreenVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Enhanced visualization state
  const [chartConfig, setChartConfig] = useState({
    type: 'bar', // 'bar', 'line', 'scatter', 'area', 'pie'
    xAxis: '', // Variable name for X-axis
    yAxis: '', // Variable name for Y-axis
    showTrendline: false,
    showLegend: true,
    showDataLabels: false,
  });

  // Advanced filtering and comparison
  const [filterOptions, setFilterOptions] = useState({
    enabled: false,
    variable: '',
    operator: '>',
    value: 0,
  });

  const [comparison, setComparison] = useState({
    enabled: false,
    variable: '',
    runs: [],
  });

  // Display mode state
  const [advancedMode, setAdvancedMode] = useState(false);

  // Track available variables dynamically
  const [availableVariables, setAvailableVariables] = useState([]);
  const [secondaryYAxis, setSecondaryYAxis] = useState({
    enabled: false,
    variable: '',
  });

  // UI state for collapsible sections
  const [collapsibleSections, setCollapsibleSections] = useState({
    chartConfig: true,
    statistics: true,
    variables: true,
    dataTable: false,
  });

  // Toggle collapsible section
  const toggleSection = (section) => {
    setCollapsibleSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

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

  // Extract variables when simulation data changes
  useEffect(() => {
    if (!simulationData) return;

    // Extract unique output variable names from all runs
    const varSet = new Set();

    // Add run index as an available variable
    varSet.add('run_index');

    // Add number of messages as an available variable
    varSet.add('num_messages');

    // Add all output variables
    simulationData.runs.forEach((run) => {
      run.output_variables?.forEach((variable) => {
        varSet.add(variable.name);
      });
    });

    // Convert to array for dropdown selection
    const variables = Array.from(varSet);
    setAvailableVariables(variables);

    // Set default axes if not already set
    if (!chartConfig.xAxis && variables.length > 0) {
      setChartConfig((prev) => ({
        ...prev,
        xAxis: 'run_index',
        yAxis: variables.find((v) => v !== 'run_index') || variables[0],
      }));
    }
  }, [simulationData]);

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

  // Get data for a specific variable across all runs
  const getDataForVariable = (variableName) => {
    if (!simulationData || !variableName) return [];

    if (variableName === 'run_index') {
      return simulationData.runs.map((_, index) => index + 1);
    }

    if (variableName === 'num_messages') {
      return simulationData.runs.map((run) => Number(run.num_messages || 0));
    }

    return simulationData.runs.map((run) => {
      const found = run.output_variables?.find((v) => v.name === variableName);
      // Try to convert to number if possible, otherwise return the string value
      const value = found ? found.value : null;
      return !isNaN(Number(value)) ? Number(value) : value;
    });
  };

  // Check if data is numeric
  const isDataNumeric = (data) => {
    return data.every((val) => val !== null && !isNaN(Number(val)));
  };

  // Apply filters to data
  const applyFilters = (data) => {
    if (!filterOptions.enabled || !filterOptions.variable || !filterOptions.operator) {
      return data;
    }

    const filterValues = getDataForVariable(filterOptions.variable);
    const filterValue = Number(filterOptions.value);

    return data.filter((_, index) => {
      const val = Number(filterValues[index]);

      if (isNaN(val)) return true;

      switch (filterOptions.operator) {
        case '>':
          return val > filterValue;
        case '>=':
          return val >= filterValue;
        case '<':
          return val < filterValue;
        case '<=':
          return val <= filterValue;
        case '==':
          return val === filterValue;
        case '!=':
          return val !== filterValue;
        default:
          return true;
      }
    });
  };

  // Generate chart options based on current configuration
  const generateChartOptions = () => {
    if (!simulationData) return {};

    // Get raw data
    let xData = getDataForVariable(chartConfig.xAxis);
    let yData = getDataForVariable(chartConfig.yAxis);

    // Create data points
    let dataPoints = xData.map((x, index) => ({
      index,
      x,
      y: yData[index],
      runIndex: index + 1,
    }));

    // Apply filters if enabled
    if (filterOptions.enabled) {
      dataPoints = applyFilters(dataPoints);
    }

    // Re-extract x and y values after filtering
    xData = dataPoints.map((p) => p.x);
    yData = dataPoints.map((p) => p.y);

    // Determine if data is numeric
    const xNumeric = isDataNumeric(xData);
    const yNumeric = isDataNumeric(yData);

    // Generate series
    let series = [];

    // Handle comparison mode
    if (comparison.enabled && comparison.variable && comparison.runs.length > 0) {
      // Main series
      series.push({
        name: chartConfig.yAxis,
        type: chartConfig.type === 'area' ? 'line' : chartConfig.type,
        areaStyle: chartConfig.type === 'area' ? {} : undefined,
        data: dataPoints.map((point) => [point.x, point.y]),
        emphasis: { focus: 'series' },
        label: {
          show: chartConfig.showDataLabels,
          position: 'top',
          textStyle: { color: '#fff' },
        },
        markLine: chartConfig.showTrendline
          ? {
              silent: true,
              lineStyle: {
                color: '#fff',
                width: 1,
                opacity: 0.5,
                type: 'dashed',
              },
              data: [{ type: 'average', name: 'Avg' }],
            }
          : undefined,
      });

      // Comparison series
      const compareData = getDataForVariable(comparison.variable);

      comparison.runs.forEach((runIndex) => {
        const actualIndex = runIndex - 1;
        series.push({
          name: `Run ${runIndex} - ${comparison.variable}`,
          type: 'line',
          markPoint: {
            symbolSize: 15,
            data: [
              {
                name: `Run ${runIndex}`,
                xAxis: xData.includes(xData[actualIndex]) ? xData[actualIndex] : null,
                yAxis: compareData[actualIndex],
              },
            ],
          },
          data: [
            [
              xData.includes(xData[actualIndex]) ? xData[actualIndex] : null,
              compareData[actualIndex],
            ],
          ],
        });
      });
    }
    // Handle secondary Y-axis
    else if (secondaryYAxis.enabled && secondaryYAxis.variable) {
      // Main Y-axis series
      series.push({
        name: chartConfig.yAxis,
        type: chartConfig.type === 'area' ? 'line' : chartConfig.type,
        areaStyle: chartConfig.type === 'area' ? {} : undefined,
        data: dataPoints.map((point) => [point.x, point.y]),
        emphasis: { focus: 'series' },
        label: {
          show: chartConfig.showDataLabels,
          position: 'top',
          textStyle: { color: '#fff' },
        },
        markLine: chartConfig.showTrendline
          ? {
              silent: true,
              lineStyle: {
                color: '#fff',
                width: 1,
                opacity: 0.5,
                type: 'dashed',
              },
              data: [{ type: 'average', name: 'Avg' }],
            }
          : undefined,
      });

      // Secondary Y-axis series
      const secondaryYData = getDataForVariable(secondaryYAxis.variable);
      series.push({
        name: secondaryYAxis.variable,
        type: 'line',
        yAxisIndex: 1,
        data: dataPoints.map((point) => [point.x, secondaryYData[point.index]]),
        emphasis: { focus: 'series' },
        itemStyle: {
          color: 'rgba(39, 221, 206, 0.8)',
        },
      });
    }
    // Standard single series
    else {
      series.push({
        name: chartConfig.yAxis,
        type: chartConfig.type === 'area' ? 'line' : chartConfig.type,
        areaStyle: chartConfig.type === 'area' ? {} : undefined,
        smooth: chartConfig.type === 'line' || chartConfig.type === 'area',
        data: dataPoints.map((point) => [point.x, point.y]),
        emphasis: { focus: 'series' },
        label: {
          show: chartConfig.showDataLabels,
          position: 'top',
          textStyle: { color: '#fff' },
        },
        markLine: chartConfig.showTrendline
          ? {
              silent: true,
              lineStyle: {
                color: '#fff',
                width: 1,
                opacity: 0.5,
                type: 'dashed',
              },
              data: [{ type: 'average', name: 'Avg' }],
            }
          : undefined,
      });
    }

    // Build chart options
    const chartOptions = {
      backgroundColor: 'transparent',
      title: {
        text: `${chartConfig.yAxis} vs ${chartConfig.xAxis}`,
        left: 'center',
        textStyle: { color: '#fff' },
      },
      grid: {
        left: '5%',
        right: secondaryYAxis.enabled ? '8%' : '5%',
        bottom: '10%',
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985',
          },
        },
        formatter: function (params) {
          const runIndex = params[0].dataIndex + 1;
          let result = `Run ${runIndex}<br/>`;
          params.forEach((param) => {
            result += `${param.seriesName}: ${param.value[1]}<br/>`;
          });
          return result;
        },
      },
      legend: {
        data: series.map((s) => s.name),
        textStyle: { color: '#fff' },
        show: chartConfig.showLegend,
      },
      toolbox: {
        feature: {
          saveAsImage: { title: 'Save as Image' },
        },
      },
      xAxis: {
        type: xNumeric ? 'value' : 'category',
        name: chartConfig.xAxis,
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: {
          color: '#fff',
        },
        axisLabel: {
          color: '#fff',
          formatter: xNumeric ? (value) => value : null,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: chartConfig.yAxis,
          nameLocation: 'middle',
          nameGap: 50,
          nameTextStyle: {
            color: '#fff',
          },
          axisLabel: { color: '#fff' },
        },
        secondaryYAxis.enabled
          ? {
              type: 'value',
              name: secondaryYAxis.variable,
              nameLocation: 'middle',
              nameGap: 50,
              nameTextStyle: {
                color: '#fff',
              },
              axisLabel: { color: '#fff' },
              position: 'right',
            }
          : undefined,
      ].filter(Boolean),
      series: series,
    };

    return chartOptions;
  };

  // Compute statistical summaries
  const computeStats = (variableName) => {
    const values = getDataForVariable(variableName);

    if (!values.length || !isDataNumeric(values)) return null;

    const nums = values.filter((val) => val !== null).map(Number);
    if (nums.length === 0) return null;

    const sum = nums.reduce((acc, num) => acc + num, 0);
    const mean = sum / nums.length;
    const sortedNums = [...nums].sort((a, b) => a - b);
    const median =
      sortedNums.length % 2 === 0
        ? (sortedNums[sortedNums.length / 2 - 1] + sortedNums[sortedNums.length / 2]) / 2
        : sortedNums[Math.floor(sortedNums.length / 2)];

    // Calculate standard deviation
    const squaredDiffs = nums.map((num) => Math.pow(num - mean, 2));
    const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / nums.length;
    const stdDev = Math.sqrt(variance);

    return {
      count: nums.length,
      mean: mean.toFixed(2),
      median: median.toFixed(2),
      stdDev: stdDev.toFixed(2),
      min: Math.min(...nums),
      max: Math.max(...nums),
    };
  };

  // Toggle between basic and advanced mode
  const toggleAdvancedMode = () => {
    setAdvancedMode(!advancedMode);
    // Reset comparison and filtering when toggling modes
    if (!advancedMode) {
      setComparison({ enabled: false, variable: '', runs: [] });
      setFilterOptions({ enabled: false, variable: '', operator: '>', value: 0 });
      setSecondaryYAxis({ enabled: false, variable: '' });
    }
  };

  // Generate message chart data
  const generateMessageChartOption = () => {
    if (!simulationData) return {};

    const messageLabels = simulationData.runs.map((_, index) => `Run ${index + 1}`);
    const messagesData = simulationData.runs.map((run) => Number(run.num_messages || 0));

    return {
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
  };

  if (loading && !isOpeningScreenVisible) {
    return (
      <div className="w-full min-h-screen bg-transparent flex flex-col justify-center items-center">
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
      <div className="w-full min-h-screen bg-transparent p-4">
        <Navbar />
        <div className="mt-20 text-red-500 text-center">
          Error loading simulation data. Please check the simulation ID and try again.
        </div>
      </div>
    );
  }

  // Render main dashboard
  return (
    <div className="w-full min-h-screen p-4 bg-transparent">
      <Navbar />
      <h1 className="text-2xl text-white font-bold mb-4 mt-22">Simulation Dashboard</h1>

      {/* Simulation Info Panel */}
      <div className="text-white">
        <div className="p-2 bg-violet-600/5 border border-violet-400 rounded mb-4">
          <p>
            <span className="font-bold">Simulation ID: </span>
            {simulationId}
          </p>
          <p>
            <span className="font-bold">Agents: </span>
            {Array.from(
              new Set(
                simulationData.runs.flatMap((run) => run.messages?.map((msg) => msg.agent) || [])
              )
            ).join(', ')}
          </p>
          <p>
            <span className="font-bold">Total Runs:</span> {simulationData.runs.length}
          </p>
        </div>
      </div>

      {/* Messages per Run Chart */}
      <div className="mb-6">
        <ReactECharts option={generateMessageChartOption()} className="h-80 w-full" />
      </div>

      {/* Mode Selector */}
      <div className="mb-6 flex space-x-4">
        <button
          onClick={toggleAdvancedMode}
          className={`px-4 py-2 rounded-md ${
            !advancedMode
              ? 'bg-violet-800 text-white'
              : 'bg-violet-900/30 border border-violet-400 text-white'
          }`}
        >
          Basic Mode
        </button>
        <button
          onClick={toggleAdvancedMode}
          className={`px-4 py-2 rounded-md ${
            advancedMode
              ? 'bg-violet-800 text-white'
              : 'bg-violet-900/30 border border-violet-400 text-white'
          }`}
        >
          Advanced Mode
        </button>
      </div>

      {/* Chart Configuration Panel */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4 p-2 bg-violet-800/20 rounded">
          <h2 className="text-xl text-white font-semibold">Chart Configuration</h2>
          <button
            onClick={() => toggleSection('chartConfig')}
            className="bg-violet-700 hover:bg-violet-600 text-white px-3 py-1 rounded-md transition-colors"
          >
            {collapsibleSections.chartConfig ? 'Hide' : 'Show'}
          </button>
        </div>

        {collapsibleSections.chartConfig && (
          <div className="p-4 bg-violet-900/10 rounded-lg border border-violet-500/50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-white">
              {/* Chart Type Selection */}
              <div>
                <label className="block mb-2">Chart Type</label>
                <select
                  value={chartConfig.type}
                  onChange={(e) => setChartConfig({ ...chartConfig, type: e.target.value })}
                  className="w-full p-2 border rounded text-black bg-white"
                >
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="scatter">Scatter Plot</option>
                  <option value="area">Area Chart</option>
                  <option value="pie">Pie Chart</option>
                </select>
              </div>

              {/* X-Axis Selection */}
              <div>
                <label className="block mb-2">X-Axis Variable</label>
                <select
                  value={chartConfig.xAxis}
                  onChange={(e) => setChartConfig({ ...chartConfig, xAxis: e.target.value })}
                  className="w-full p-2 border rounded text-black bg-white"
                >
                  <option value="">--Select--</option>
                  {availableVariables.map((variable) => (
                    <option key={`x-${variable}`} value={variable}>
                      {variable}
                    </option>
                  ))}
                </select>
              </div>

              {/* Y-Axis Selection */}
              <div>
                <label className="block mb-2">Y-Axis Variable</label>
                <select
                  value={chartConfig.yAxis}
                  onChange={(e) => setChartConfig({ ...chartConfig, yAxis: e.target.value })}
                  className="w-full p-2 border rounded text-black bg-white"
                >
                  <option value="">--Select--</option>
                  {availableVariables.map((variable) => (
                    <option key={`y-${variable}`} value={variable}>
                      {variable}
                    </option>
                  ))}
                </select>
              </div>

              {/* Visualization Options */}
              <div className="flex flex-col justify-between">
                <label className="block mb-2">Visualization Options</label>
                <div className="flex flex-col space-y-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={chartConfig.showTrendline}
                      onChange={(e) =>
                        setChartConfig({ ...chartConfig, showTrendline: e.target.checked })
                      }
                      className="mr-2"
                    />
                    Show Trendline
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={chartConfig.showLegend}
                      onChange={(e) =>
                        setChartConfig({ ...chartConfig, showLegend: e.target.checked })
                      }
                      className="mr-2"
                    />
                    Show Legend
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={chartConfig.showDataLabels}
                      onChange={(e) =>
                        setChartConfig({ ...chartConfig, showDataLabels: e.target.checked })
                      }
                      className="mr-2"
                    />
                    Show Data Labels
                  </label>
                </div>
              </div>
            </div>

            {/* Advanced Options (only in advanced mode) */}
            {advancedMode && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
                {/* Secondary Y-Axis */}
                <div className="p-3 border border-violet-400/30 rounded bg-violet-800/10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-violet-300">Secondary Y-Axis</h3>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={secondaryYAxis.enabled}
                        onChange={(e) =>
                          setSecondaryYAxis({ ...secondaryYAxis, enabled: e.target.checked })
                        }
                        className="mr-2"
                      />
                      Enable
                    </label>
                  </div>

                  {secondaryYAxis.enabled && (
                    <div>
                      <label className="block mb-2">Select Variable</label>
                      <select
                        value={secondaryYAxis.variable}
                        onChange={(e) =>
                          setSecondaryYAxis({ ...secondaryYAxis, variable: e.target.value })
                        }
                        className="w-full p-2 border rounded text-black bg-white"
                      >
                        <option value="">--Select--</option>
                        {availableVariables.map((variable) => (
                          <option key={`secondary-${variable}`} value={variable}>
                            {variable}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Data Filtering */}
                <div className="p-3 border border-violet-400/30 rounded bg-violet-800/10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-violet-300">Data Filtering</h3>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={filterOptions.enabled}
                        onChange={(e) =>
                          setFilterOptions({ ...filterOptions, enabled: e.target.checked })
                        }
                        className="mr-2"
                      />
                      Enable
                    </label>
                  </div>

                  {filterOptions.enabled && (
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block mb-2">Variable</label>
                        <select
                          value={filterOptions.variable}
                          onChange={(e) =>
                            setFilterOptions({ ...filterOptions, variable: e.target.value })
                          }
                          className="w-full p-2 border rounded text-black bg-white"
                        >
                          <option value="">--Select--</option>
                          {availableVariables
                            .filter((variable) => isDataNumeric(getDataForVariable(variable)))
                            .map((variable) => (
                              <option key={`filter-${variable}`} value={variable}>
                                {variable}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className="block mb-2">Operator</label>
                        <select
                          value={filterOptions.operator}
                          onChange={(e) =>
                            setFilterOptions({ ...filterOptions, operator: e.target.value })
                          }
                          className="w-full p-2 border rounded text-black bg-white"
                        >
                          <option value=">">Greater than (&gt;)</option>
                          <option value=">=">Greater than or equal (&gt;=)</option>
                          <option value="<">Less than (&lt;)</option>
                          <option value="<=">Less than or equal (&lt;=)</option>
                          <option value="==">Equal to (==)</option>
                          <option value="!=">Not equal to (!=)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block mb-2">Value</label>
                        <input
                          type="number"
                          value={filterOptions.value}
                          onChange={(e) =>
                            setFilterOptions({ ...filterOptions, value: e.target.value })
                          }
                          className="w-full p-2 border rounded text-black bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Run Comparison */}
                <div className="p-3 border border-violet-400/30 rounded bg-violet-800/10 md:col-span-2">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-violet-300">Run Comparison</h3>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={comparison.enabled}
                        onChange={(e) =>
                          setComparison({ ...comparison, enabled: e.target.checked })
                        }
                        className="mr-2"
                      />
                      Enable
                    </label>
                  </div>

                  {comparison.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-2">Comparison Variable</label>
                        <select
                          value={comparison.variable}
                          onChange={(e) =>
                            setComparison({ ...comparison, variable: e.target.value })
                          }
                          className="w-full p-2 border rounded text-black bg-white"
                        >
                          <option value="">--Select--</option>
                          {availableVariables.map((variable) => (
                            <option key={`comp-${variable}`} value={variable}>
                              {variable}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block mb-2">Select Runs to Compare</label>
                        <div className="flex flex-wrap gap-2">
                          {simulationData.runs.map((_, index) => (
                            <button
                              key={`run-${index + 1}`}
                              onClick={() => {
                                const runIndex = index + 1;
                                setComparison((prev) => {
                                  const isSelected = prev.runs.includes(runIndex);
                                  return {
                                    ...prev,
                                    runs: isSelected
                                      ? prev.runs.filter((r) => r !== runIndex)
                                      : [...prev.runs, runIndex],
                                  };
                                });
                              }}
                              className={`px-2 py-1 rounded text-sm ${
                                comparison.runs.includes(index + 1)
                                  ? 'bg-violet-500 text-white'
                                  : 'bg-gray-700 text-white'
                              }`}
                            >
                              Run {index + 1}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Visualization */}
      <div className="mb-6">
        {chartConfig.xAxis && chartConfig.yAxis ? (
          <div className="bg-violet-950/30 p-4 rounded-lg border border-violet-500/30">
            <ReactECharts
              option={generateChartOptions()}
              style={{ height: '500px', width: '100%' }}
              className="bg-transparent"
            />
          </div>
        ) : (
          <div className="text-white text-center p-8 bg-violet-950/30 rounded-lg border border-violet-500/30">
            <p className="text-lg">Please select variables for X and Y axes to visualize data.</p>
            <p className="text-violet-400 mt-2">
              Use the Chart Configuration panel above to customize your visualization.
            </p>
          </div>
        )}
      </div>

      {/* Statistics Panel */}
      {chartConfig.yAxis && isDataNumeric(getDataForVariable(chartConfig.yAxis)) && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4 p-2 bg-violet-800/20 rounded">
            <h2 className="text-xl text-white font-semibold">Statistics for {chartConfig.yAxis}</h2>
            <button
              onClick={() => toggleSection('statistics')}
              className="bg-violet-700 hover:bg-violet-600 text-white px-3 py-1 rounded-md transition-colors"
            >
              {collapsibleSections.statistics ? 'Hide' : 'Show'}
            </button>
          </div>

          {collapsibleSections.statistics && (
            <div className="p-4 bg-violet-900/10 rounded-lg border border-violet-500/50">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(computeStats(chartConfig.yAxis) || {}).map(([stat, value]) => (
                  <div
                    key={stat}
                    className="bg-violet-800/20 p-3 rounded border border-violet-400/40"
                  >
                    <h3 className="text-violet-300 font-medium">
                      {stat.charAt(0).toUpperCase() + stat.slice(1)}
                    </h3>
                    <p className="text-white text-xl font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              {secondaryYAxis.enabled && secondaryYAxis.variable && (
                <div className="mt-4">
                  <h3 className="text-lg text-violet-300 font-medium mb-2">
                    Statistics for {secondaryYAxis.variable} (Secondary Y-Axis)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {Object.entries(computeStats(secondaryYAxis.variable) || {}).map(
                      ([stat, value]) => (
                        <div
                          key={stat}
                          className="bg-violet-800/20 p-3 rounded border border-violet-400/40"
                        >
                          <h3 className="text-teal-300 font-medium">
                            {stat.charAt(0).toUpperCase() + stat.slice(1)}
                          </h3>
                          <p className="text-white text-xl font-semibold">{value}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* All Variables Summary */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4 p-2 bg-violet-800/20 rounded">
          <h2 className="text-xl text-white font-semibold">All Variables Summary</h2>
          <button
            onClick={() => toggleSection('variables')}
            className="bg-violet-700 hover:bg-violet-600 text-white px-3 py-1 rounded-md transition-colors"
          >
            {collapsibleSections.variables ? 'Hide' : 'Show'}
          </button>
        </div>

        {collapsibleSections.variables && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {availableVariables.map((variable) => {
              const values = getDataForVariable(variable);
              const numeric = isDataNumeric(values);
              const stats = numeric ? computeStats(variable) : null;

              return (
                <div
                  key={variable}
                  className="text-white bg-violet-600/5 border border-violet-400/50 p-4 rounded shadow hover:shadow-md hover:shadow-violet-400/30 cursor-pointer transition-all duration-200"
                  onClick={() => setChartConfig({ ...chartConfig, yAxis: variable })}
                >
                  <h3 className="font-medium text-lg mb-2 text-violet-300">{variable}</h3>
                  {numeric ? (
                    <div>
                      <p className="text-sm text-gray-400">Mean: {stats.mean}</p>
                      <p className="text-sm text-gray-400">
                        Range: {stats.min} - {stats.max}
                      </p>
                      <p className="text-sm text-gray-400">StdDev: {stats.stdDev}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      {values.slice(0, 3).join(', ')}
                      {values.length > 3 ? '...' : ''}
                    </p>
                  )}
                  <div className="mt-2 text-xs text-violet-400">Click to set as Y-axis</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4 p-2 bg-violet-800/20 rounded">
          <h2 className="text-xl text-white font-semibold">Data Table</h2>
          <button
            onClick={() => toggleSection('dataTable')}
            className="bg-violet-700 hover:bg-violet-600 text-white px-3 py-1 rounded-md transition-colors"
          >
            {collapsibleSections.dataTable ? 'Hide' : 'Show'}
          </button>
        </div>

        {collapsibleSections.dataTable && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-white border-collapse">
              <thead>
                <tr className="bg-violet-800/20">
                  <th className="text-white border border-violet-400/40 px-4 py-2">Run</th>
                  {availableVariables.map((variable) => (
                    <th
                      key={`header-${variable}`}
                      className="text-white border border-violet-400/40 px-4 py-2"
                    >
                      {variable}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {simulationData.runs.map((run, index) => (
                  <tr key={`run-${index}`} className="even:bg-violet-900/5">
                    <td className="text-white border border-violet-400/20 px-4 py-2">
                      {index + 1}
                    </td>
                    {availableVariables.map((variable) => {
                      let value;
                      if (variable === 'run_index') {
                        value = index + 1;
                      } else if (variable === 'num_messages') {
                        value = run.num_messages || 0;
                      } else {
                        const found = run.output_variables?.find((v) => v.name === variable);
                        value = found ? found.value : 'N/A';
                      }

                      return (
                        <td
                          key={`cell-${index}-${variable}`}
                          className="border border-violet-400/20 px-4 py-2"
                        >
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
