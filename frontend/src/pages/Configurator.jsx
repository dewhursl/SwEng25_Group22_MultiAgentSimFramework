import { useState } from 'react';

/* 
  **************************************************
  UI elements used to build the configuration panels
  ************************************************** 
*/

// Simple button wrapper with varialbe background color
const Button = ({ children, color, onClick }) => (
  <button
    className={`p-1 rounded-lg min-w-20 bg-${color}-600 hover:bg-${color}-300`}
    onClick={onClick}
  >
    {children}
  </button>
);

// Displays children as a sequence with an indent line on the left
const Sequence = ({ children }) => {
  return <div className="pl-1 border-gray-500 border-l-1">{children}</div>;
};

// Container for sequence elements
const SequenceElement = ({ children }) => <div className="m-1 p-1 rounded-lg">{children}</div>;

// A field where the user can add and remove elements from the field. The parent object contains
// the state and provides a buidler method for building a new element
const SequenceField = ({ children, elements, setElements, elementBuilder }) => {
  const addElement = () => {
    setElements((prev) => [...prev, elementBuilder()]);
  };

  const removeElement = (index) => {
    setElements((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  return (
    <div className="">
      {children}
      <Button color="green" onClick={() => addElement()}>
        Add
      </Button>
      <Sequence>
        {elements.map((element, index) => (
          <SequenceElement key={index}>
            <div className="">
              <Button color="red" onClick={() => removeElement(index)}>
                Remove
              </Button>
              {element}
            </div>
          </SequenceElement>
        ))}
      </Sequence>
    </div>
  );
};

// Wrapper for an input field
const Input = ({ children, type, value, setValue }) => (
  <label className="p-1">
    {children}
    <input
      className="m-1 border bg-stale-800"
      type={type}
      defaultValue={value}
      onChange={(e) => setValue(e.target.value)}
    ></input>
  </label>
);

// Container for a configuration panel
const Panel = ({ children }) => <div className="flex flex-col">{children}</div>;

/*
  ****************************************
  Definitions for the configuration panels
  ****************************************
*/

const Parameter = () => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');

  return (
    <Panel>
      <Input type="text" value={name} setValue={setName}>
        Name
      </Input>
      <Input type="text" value={value} setValue={setValue}>
        Value
      </Input>
    </Panel>
  );
};

const Agent = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [freePrompt, setFreePrompt] = useState('');
  const [parameters, setParameters] = useState([]);

  return (
    <Panel>
      <Input type="text" value={name} setValue={setName}>
        Name
      </Input>
      <Input type="text" value={description} setDescription={setDescription}>
        Description
      </Input>
      <Input type="text" value={freePrompt} setValue={setFreePrompt}>
        Free Prompt
      </Input>
      <SequenceField
        elements={parameters}
        setElements={setParameters}
        elementBuilder={() => <Parameter />}
      >
        Parameters
      </SequenceField>
    </Panel>
  );
};

const Simulation = () => {
  const [numRuns, setNumRuns] = useState('');
  const [agents, setAgents] = useState([]);

  return (
    <Panel>
      <Input type="number" value={numRuns} setValue={setNumRuns}>
        Number of Runs
      </Input>
      <SequenceField elements={agents} setElements={setAgents} elementBuilder={() => <Agent />}>
        Agents
      </SequenceField>
    </Panel>
  );
};

const Configurator = () => {
  const [simulations, setSimulations] = useState([]);

  return (
    <div className="text-white">
      <Panel>
        <SequenceField
          elements={simulations}
          setElements={setSimulations}
          elementBuilder={() => <Simulation />}
        >
          Simulations
        </SequenceField>
      </Panel>
    </div>
  );
};

export default Configurator;
