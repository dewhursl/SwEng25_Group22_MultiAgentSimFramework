import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService.js';
import Navbar from './components/Navbar';

const TextField = ({ label, description, value, onChange, placeholder }) => {
  return (
    <label className="flex flex-col mt-3 p-3 border border-gray-700 rounded-lg text-white bg-slate-800 hover:border-white">
      <h1 className="font-bold text-lg">{label}</h1>
      <p className="text-gray-300 text-sm mb-2">{description}</p>
      <input
        className="mt-1 p-2 rounded-lg outline-none bg-slate-700 focus:bg-slate-600 border border-gray-600"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
};

const TextArea = ({ label, description, value, onChange, placeholder }) => {
  return (
    <label className="flex flex-col mt-3 p-3 border border-gray-700 rounded-lg text-white bg-slate-800 hover:border-white">
      <h1 className="font-bold text-lg">{label}</h1>
      <p className="text-gray-300 text-sm mb-2">{description}</p>
      <textarea
        className="mt-1 p-2 rounded-lg outline-none bg-slate-700 focus:bg-slate-600 border border-gray-600 min-h-24"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
};

const Button = ({ children, onClick, color = 'green', disabled = false }) => {
  const baseClasses = 'p-2 mt-3 rounded-lg font-bold text-white transition-colors duration-200';
  const colorClasses = {
    green: `${disabled ? 'bg-gray-600' : 'bg-green-800 hover:bg-green-600'}`,
    red: `${disabled ? 'bg-gray-600' : 'bg-red-800 hover:bg-red-600'}`,
    blue: `${disabled ? 'bg-gray-600' : 'bg-blue-800 hover:bg-blue-600'}`,
  };

  return (
    <button
      className={`${baseClasses} ${colorClasses[color]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Select = ({ label, description, options, value, onChange }) => {
  return (
    <label className="flex flex-col mt-3 p-3 border border-gray-700 rounded-lg text-white bg-slate-800 hover:border-white">
      <h1 className="font-bold text-lg">{label}</h1>
      <p className="text-gray-300 text-sm mb-2">{description}</p>
      <select
        className="mt-1 p-2 rounded-lg outline-none bg-slate-700 focus:bg-slate-600 border border-gray-600"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};

const AgentsList = ({ agents, setAgents }) => {
  const addAgent = () => {
    setAgents([
      ...agents,
      {
        name: '',
        description: '',
        prompt: '',
      },
    ]);
  };

  const updateAgent = (index, field, value) => {
    const updatedAgents = [...agents];
    updatedAgents[index] = {
      ...updatedAgents[index],
      [field]: value,
    };
    setAgents(updatedAgents);
  };

  const removeAgent = (index) => {
    const updatedAgents = [...agents];
    updatedAgents.splice(index, 1);
    setAgents(updatedAgents);
  };

  return (
    <div className="flex flex-col p-3 mt-3 border border-gray-700 rounded-lg text-white bg-slate-800">
      <h1 className="font-bold text-lg">Agents</h1>
      <p className="text-gray-300 text-sm">
        Define the agents that will participate in the simulation
      </p>
      <Button color="green" onClick={addAgent}>
        Add Agent
      </Button>

      <div className="mt-3 space-y-4">
        {agents.map((agent, index) => (
          <div key={index} className="p-3 border border-gray-700 rounded-lg bg-slate-700">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">Agent #{index + 1}</h2>
              <Button color="red" onClick={() => removeAgent(index)}>
                Remove
              </Button>
            </div>

            <TextField
              label="Name"
              description="The name of this agent"
              value={agent.name}
              onChange={(value) => updateAgent(index, 'name', value)}
              placeholder="e.g., Judge, Prosecutor, DefenseLawyer"
            />

            <TextField
              label="Description"
              description="Brief description of this agent's role"
              value={agent.description}
              onChange={(value) => updateAgent(index, 'description', value)}
              placeholder="e.g., Presides over the court case"
            />

            <TextArea
              label="Prompt"
              description="The prompt that defines this agent's behavior"
              value={agent.prompt}
              onChange={(value) => updateAgent(index, 'prompt', value)}
              placeholder="e.g., You are a judge presiding over a court case..."
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const OutputVariablesList = ({ variables, setVariables }) => {
  const addVariable = () => {
    setVariables([
      ...variables,
      {
        name: '',
        type: 'String',
      },
    ]);
  };

  const updateVariable = (index, field, value) => {
    const updatedVariables = [...variables];
    updatedVariables[index] = {
      ...updatedVariables[index],
      [field]: value,
    };
    setVariables(updatedVariables);
  };

  const removeVariable = (index) => {
    const updatedVariables = [...variables];
    updatedVariables.splice(index, 1);
    setVariables(updatedVariables);
  };

  return (
    <div className="flex flex-col p-3 mt-3 border border-gray-700 rounded-lg text-white bg-slate-800">
      <h1 className="font-bold text-lg">Output Variables</h1>
      <p className="text-gray-300 text-sm">
        Define the variables to be extracted from the simulation
      </p>
      <Button color="green" onClick={addVariable}>
        Add Variable
      </Button>

      <div className="mt-3 space-y-4">
        {variables.map((variable, index) => (
          <div key={index} className="p-3 border border-gray-700 rounded-lg bg-slate-700">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">Variable #{index + 1}</h2>
              <Button color="red" onClick={() => removeVariable(index)}>
                Remove
              </Button>
            </div>

            <TextField
              label="Name"
              description="The name of this output variable"
              value={variable.name}
              onChange={(value) => updateVariable(index, 'name', value)}
              placeholder="e.g., verdict, sentence_length"
            />

            <Select
              label="Type"
              description="The data type of this variable"
              options={[
                { label: 'String', value: 'String' },
                { label: 'Number', value: 'Number' },
                { label: 'Boolean', value: 'Boolean' },
              ]}
              value={variable.type}
              onChange={(value) => updateVariable(index, 'type', value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const JsonPreview = ({ data }) => {
  return data ? (
    <div className="mt-4 p-3 border border-gray-700 rounded-lg bg-slate-900 overflow-auto max-h-60">
      <h2 className="font-bold text-white mb-2">Generated JSON Configuration:</h2>
      <pre className="text-green-400 text-sm">{JSON.stringify(data, null, 2)}</pre>
    </div>
  ) : null;
};

const Configurator = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [numRuns, setNumRuns] = useState(10);
  const [agents, setAgents] = useState([]);
  const [terminationCondition, setTerminationCondition] = useState('');
  const [outputVariables, setOutputVariables] = useState([]);
  const [simulationConfig, setSimulationConfig] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    if (!name.trim()) {
      setError('Please provide a simulation name');
      return false;
    }

    if (numRuns <= 0) {
      setError('Number of runs must be greater than 0');
      return false;
    }

    if (agents.length === 0) {
      setError('Please add at least one agent');
      return false;
    }

    // Validate agents
    for (const agent of agents) {
      if (!agent.name.trim() || !agent.description.trim() || !agent.prompt.trim()) {
        setError('All agent fields must be filled out');
        return false;
      }
    }

    if (!terminationCondition.trim()) {
      setError('Please provide a termination condition');
      return false;
    }

    if (outputVariables.length === 0) {
      setError('Please add at least one output variable');
      return false;
    }

    // Validate output variables
    for (const variable of outputVariables) {
      if (!variable.name.trim()) {
        setError('All output variables must have a name');
        return false;
      }
    }

    return true;
  };

  const createSimulationConfig = () => {
    if (!validateForm()) {
      return;
    }

    const config = {
      num_runs: parseInt(numRuns),
      config: {
        name: name,
        agents: agents,
        termination_condition: terminationCondition,
        output_variables: outputVariables,
      },
    };

    setSimulationConfig(config);
    setError('');
  };

  const submitSimulation = async () => {
    if (!simulationConfig) {
      createSimulationConfig();
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await apiService.createSimulation(simulationConfig);
      console.log('Simulation created:', response);
      navigate('/simulations');
    } catch (err) {
      setError(`Failed to create simulation: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-slate-900 py-8">
      <Navbar />
      <div className="w-full max-w-3xl px-4">
        <h1 className="text-2xl font-bold text-white mb-6">Simulation Configurator</h1>
        <Button color="blue" onClick={() => navigate('/simulations')}>
          View Simulation Catalog
        </Button>
        {error && (
          <div className="p-3 mb-4 bg-red-900 border border-red-700 text-white rounded-lg">
            {error}
          </div>
        )}

        <TextField
          label="Simulation Name"
          description="Provide a descriptive name for this simulation"
          value={name}
          onChange={setName}
          placeholder="e.g., Criminal Trial Simulation"
        />

        <TextField
          label="Number of Runs"
          description="How many times should this simulation be executed"
          value={numRuns}
          onChange={(value) => setNumRuns(value)}
          placeholder="e.g., 10"
        />

        <AgentsList agents={agents} setAgents={setAgents} />

        <TextArea
          label="Termination Condition"
          description="When should the simulation end"
          value={terminationCondition}
          onChange={setTerminationCondition}
          placeholder="e.g., The judge has delivered a verdict"
        />

        <OutputVariablesList variables={outputVariables} setVariables={setOutputVariables} />

        <div className="flex flex-col md:flex-row gap-3 mt-4">
          <Button color="blue" onClick={createSimulationConfig}>
            Generate Configuration
          </Button>

          <Button color="green" onClick={submitSimulation} disabled={isSubmitting}>
            {isSubmitting
              ? 'Creating Simulation...'
              : simulationConfig
                ? 'Submit Simulation'
                : 'Submit & Run Simulation'}
          </Button>
        </div>

        <JsonPreview data={simulationConfig} />
      </div>
    </div>
  );
};

export default Configurator;
