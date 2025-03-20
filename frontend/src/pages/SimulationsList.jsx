import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService.js';

const StatusBadge = ({ progress }) => {
  let status, bgClass;

  if (progress === 100) {
    status = 'Completed';
    bgClass = 'bg-green-600';
  } else if (progress === 0) {
    status = 'Pending';
    bgClass = 'bg-yellow-600';
  } else {
    status = 'Running';
    bgClass = 'bg-blue-600';
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${bgClass}`}>
      {status}
    </span>
  );
};

const SimulationItem = ({ simulation, onViewResults }) => {
  // Calculate estimated completion time based on progress
  const getEstimatedCompletion = (progress) => {
    if (progress === 100) return null;
    if (progress === 0) return 'Waiting to start';

    // Simple estimation - just for demo purposes
    const remainingPercentage = 100 - progress;
    let timeEstimate;

    if (remainingPercentage > 75) {
      timeEstimate = 'About 1 hour';
    } else if (remainingPercentage > 50) {
      timeEstimate = 'About 30 minutes';
    } else if (remainingPercentage > 25) {
      timeEstimate = 'About 15 minutes';
    } else {
      timeEstimate = 'Less than 5 minutes';
    }

    return timeEstimate;
  };

  const estimatedCompletion = getEstimatedCompletion(simulation.progress_percentage);

  return (
    <div className="p-4 mb-3 bg-slate-800 rounded-lg border border-gray-700 hover:border-white transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">{simulation.name}</h2>
          <p className="text-gray-300 text-sm mb-2">ID: {simulation.simulation_id}</p>
          <div className="flex items-center gap-4">
            <StatusBadge progress={simulation.progress_percentage} />
            <span className="text-gray-400 text-sm">{simulation.expected_runs} runs total</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {simulation.progress_percentage === 100 && (
            <button
              onClick={() => onViewResults(simulation.simulation_id)}
              className="px-3 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded transition-colors"
            >
              View Results
            </button>
          )}
        </div>
      </div>

      {simulation.progress_percentage > 0 && simulation.progress_percentage < 100 && (
        <div className="mt-3 text-sm text-gray-400">
          <p>Estimated completion: {estimatedCompletion}</p>
          <div className="w-full bg-slate-700 rounded-full h-2 mt-1">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${simulation.progress_percentage}%` }}
            ></div>
          </div>
          <p className="mt-1 text-right text-xs">{simulation.progress_percentage}% complete</p>
        </div>
      )}
    </div>
  );
};

const SimulationsList = () => {
  const navigate = useNavigate();
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch simulations from API
    const fetchSimulations = async () => {
      setLoading(true);
      try {
        const data = await apiService.getSimulationsCatalog();
        setSimulations(data);
        setLoading(false);
      } catch (err) {
        setError(`Failed to fetch simulations: ${err.message}`);
        setLoading(false);
      }
    };

    fetchSimulations();

    // Set up polling to refresh data periodically
    const intervalId = setInterval(fetchSimulations, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId); // Clean up on unmount
  }, []);

  const handleViewResults = (simulationId) => {
    // Navigate to the renderer view for this simulation
    navigate(`/renderer/${simulationId}`);
  };

  return (
    <div className="flex justify-center min-h-screen bg-slate-900 py-8">
      <div className="w-full max-w-4xl px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Simulations</h1>
          <Link
            to="/configurator"
            className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            Create New Simulation
          </Link>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-red-900 border border-red-700 text-white rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-white">Loading simulations...</div>
          </div>
        ) : (
          <>
            {simulations.length === 0 ? (
              <div className="bg-slate-800 rounded-lg p-8 text-center">
                <p className="text-gray-300 mb-4">No simulations found</p>
                <Link
                  to="/configurator"
                  className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg inline-block"
                >
                  Create Your First Simulation
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {simulations.map((sim) => (
                  <SimulationItem
                    key={sim.simulation_id}
                    simulation={sim}
                    onViewResults={handleViewResults}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SimulationsList;
