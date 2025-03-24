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

const TextArea = ({ label, description, value, onChange, placeholder, height = 'min-h-24' }) => {
  return (
    <label className="flex flex-col mt-3 p-3 border border-gray-700 rounded-lg text-white bg-slate-800 hover:border-white">
      <h1 className="font-bold text-lg">{label}</h1>
      <p className="text-gray-300 text-sm mb-2">{description}</p>
      <textarea
        className={`mt-1 p-2 rounded-lg outline-none bg-slate-700 focus:bg-slate-600 border border-gray-600 ${height}`}
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
    purple: `${disabled ? 'bg-gray-600' : 'bg-violet-800 hover:bg-violet-600'}`,
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

const AIConfigGenerator = ({ onConfigGenerated, isGenerating, setIsGenerating }) => {
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');

  const demoPrompts = [
    "Simulate the final moments of the O.J. Simpson trial. Include a judge, prosecutor, and defense attorney. " +
    "Focus on the closing statements, jury verdict, and potential sentencing. Keep the conversation short, direct, " +
    "and logical, avoiding unnecessary emotion or lengthy arguments. Track the verdict (guilty or not guilty) and " +
    "sentence length if applicable.Keep your messages short concise and logical.",

    "Design a business negotiation simulation with a buyer, seller, and mediator. Keep your messages short concise and logical." +
    "They are buying a house and the seller is trying to sell it. Track the final price and whether a deal was reached.",

    "Simulate a hospital examination scenario involving one doctor, one patient presenting flu-like symptoms, and one " +
    "assisting nurse. The doctor conducts a structured interview, reviews symptoms, orders basic tests (like temperature " +
    "check and blood test), and discusses findings with the nurse. The simulation should focus on reaching an accurate " +
    "diagnosis (e.g., influenza, bacterial infection, or other condition) and formulating a treatment plan (e.g., " +
    "medication, rest, further testing). Track what the diagnosis is and what is the cost of treatment without insurance, " +
    " as well as the appropriateness of the treatment plan. Keep your messages short concise and logical.",

    "Simulate a live political debate featuring three candidates running for national office and one moderator. " +
    "The debate covers three key topics: healthcare, taxation, and climate policy. Each candidate presents their " +
    "stance and responds to questions posed by the moderator, as well as rebuttals from other candidates. Track shifts " +
    "in public opinion after each topic based on candidates' performance, clarity, and persuasiveness. Also log key " +
    "discussion points, notable arguments, and any factual inaccuracies detected during the debate. " +
    "Keep your messages short concise and logical.",
  ];

  const getRandomPrompt = () => {
    const randomIndex = Math.floor(Math.random() * demoPrompts.length);
    setPrompt(demoPrompts[randomIndex]);
  };

  const generateConfig = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt for the AI to generate a configuration');
      return;
    }

    try {
      setError('');
      setIsGenerating(true);
      const configData = await apiService.generateSimulationConfig({ desc: prompt });
      onConfigGenerated(configData);
    } catch (err) {
      setError(`Failed to generate configuration: ${err.message}`);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col p-3 mt-3 border border-gray-700 rounded-lg text-white bg-slate-800 relative">
      {isGenerating && (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-white mb-2"></div>
            <p className="text-white">Generating Configuration...</p>
            <p className="text-gray-400 text-sm mt-2">This may take a few moments</p>
          </div>
        </div>
      )}

      <h1 className="font-bold text-lg">AI-Generated Configuration</h1>
      <p className="text-gray-300 text-sm mb-2">
        Describe your simulation in natural language, and let AI generate a configuration for you
      </p>

      {error && (
        <div className="p-3 mb-3 bg-red-900 border border-red-700 text-white rounded-lg">
          {error}
        </div>
      )}

      <TextArea
        label="Simulation Description"
        description="Describe your simulation in detail. Include information about the agents, their roles, the scenario, and what outcomes you want to track."
        value={prompt}
        onChange={setPrompt}
        placeholder="e.g., Create a court case simulation with a judge, prosecutor, and defense attorney. The simulation should track the verdict and sentence length..."
        height="min-h-48"
      />

      <div className="flex items-center gap-3 mt-3">
        <Button color="blue" onClick={getRandomPrompt}>
          Random Prompt
        </Button>
        <span className="text-white text-xl">→</span>
        <Button color="purple" onClick={generateConfig} disabled={isGenerating}>
          {isGenerating ? 'Generating Configuration...' : 'Generate Configuration with AI'}
        </Button>
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

const Tab = ({ label, isActive, onClick }) => {
  return (
    <button
      className={`px-4 py-2 font-medium rounded-t-lg ${
        isActive
          ? 'bg-slate-800 text-white border-t border-r border-l border-gray-600'
          : 'bg-slate-900 text-gray-400 hover:text-white'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

const Configurator = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ai'); // Changed from 'manual' to 'ai'

  // Manual configuration state
  const [name, setName] = useState('');
  const [numRuns, setNumRuns] = useState(1);
  const [agents, setAgents] = useState([]);
  const [terminationCondition, setTerminationCondition] = useState('');
  const [outputVariables, setOutputVariables] = useState([]);

  // Shared state
  const [simulationConfig, setSimulationConfig] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  // Handle AI-generated configuration
  const handleConfigGenerated = (config) => {
    setIsGenerating(false);

    if (!config || !config.config) {
      setError('Invalid configuration generated');
      return;
    }

    // Update form fields with the generated config
    const generatedConfig = config.config;
    setName(generatedConfig.name || '');
    setNumRuns(10); // Set to 10 runs by default
    setAgents(generatedConfig.agents || []);
    setTerminationCondition(generatedConfig.termination_condition || '');
    setOutputVariables(generatedConfig.output_variables || []);

    // Set the full configuration with 10 runs
    setSimulationConfig({
      ...config,
      num_runs: 10
    });

    // Log the simulation ID
    console.log(`Retrieved simulation: ${config.id}\n`);

    // Log the simulation data in a structured format
    console.log(`Simulation Name: ${generatedConfig.name}\n`);
    console.log(`Termination Condition: ${generatedConfig.termination_condition}\n`);
    console.log(`Agents:\n`);

    // Use console.table for better visualization of agents
    console.table(generatedConfig.agents);

    // Log output variables
    console.log(`Output Variables:\n`);
    console.table(generatedConfig.output_variables);
  };

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
    <div className="flex justify-center min-h-screen mb-2 py-16">
      <Navbar />
      <div className="w-full max-w-3xl px-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold mt-8 text-white">Simulation Configurator</h1>
          <Button color="blue" onClick={() => navigate('/simulations')}>
            View Simulation Catalog
          </Button>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-red-900 border border-red-700 text-white rounded-lg">
            {error}
          </div>
        )}

        {/* Tab navigation */}
        <div className="flex border-b border-gray-700 mt-6">
          <Tab
            label="Manual Configuration"
            isActive={activeTab === 'manual'}
            onClick={() => setActiveTab('manual')}
          />
          <Tab
            label="AI-Generated Configuration"
            isActive={activeTab === 'ai'}
            onClick={() => setActiveTab('ai')}
          />
        </div>

        {/* Tab content */}
        <div className="pt-4">
          {activeTab === 'manual' ? (
            // Manual configuration form
            <>
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
            </>
          ) : (
            // AI configuration generator
            <AIConfigGenerator
              onConfigGenerated={handleConfigGenerated}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
            />
          )}

          <div className="flex flex-col md:flex-row gap-3 mt-4">
            {activeTab === 'manual' && (
              <Button color="blue" onClick={createSimulationConfig}>
                Generate Configuration
              </Button>
            )}

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
    </div>
  );
};

export default Configurator;
