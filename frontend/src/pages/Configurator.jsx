import { useState } from 'react';

const TextField = ({ children }) => {
  const [value, setValue] = useState('');

  return (
    <label className="flex flex-col mt-1 p-2 border-1 border-transparent rounded-lg text-white bg-slate-800 hover:border-white">
      {children}
      <input
        className="mt-1 rounded-lg outline-none bg-slate-700 focus:bg-slate-600"
        type="text"
        defaultValue={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </label>
  );
};

const Button = ({ children, onClick }) => (
  <button
    className="p-1 mt-1 rounded-lg font-bold text-white bg-slate-800 hover:bg-green-600"
    onClick={onClick}
  >
    {children}
  </button>
);

const AcceptButton = ({ children, onClick }) => (
  <button
    className="p-1 mt-1 rounded-lg font-bold text-white bg-green-800 hover:bg-green-600"
    onClick={onClick}
  >
    {children}
  </button>
);

const RejectButton = ({ children, onClick }) => (
  <button
    className="p-1 mt-1 rounded-lg font-bold text-white bg-red-800 hover:bg-red-600"
    onClick={onClick}
  >
    {children}
  </button>
);

const Sequence = ({ children, elementBuilder }) => {
  const [elements, setElements] = useState([]);

  const addElement = () => setElements((prev) => [...prev, elementBuilder()]);

  const removeElement = (index) => {
    setElements((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  return (
    <div className="flex flex-col p-2 mt-1 border-1 border-transparent rounded-lg text-white bg-slate-800">
      {children}
      <AcceptButton onClick={addElement}>Add</AcceptButton>
      <ul className="mt-1">
        {elements.map((element, index) => (
          <li key={index} className="flex flex-col mt-2 ml-1 p-1 border-l-1  rounded-lg">
            {element}
            <RejectButton onClick={(index) => removeElement(index)}>Remove</RejectButton>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Configurator = () => {
  const instanceBuilder = () => (
    <>
      <TextField>
        <h1 className="font-bold">Name</h1>
        <p>The name used to reference this parameter</p>
      </TextField>
      <TextField>
        <h1 className="font-bold">Value</h1>
        <p>Prompt describing this parameter</p>
      </TextField>
    </>
  );

  const generateSimulation = null;

  const runSimulation = null;

  return (
    <div className="flex flex-col">
      <TextField>
        <h1 className="font-bold">Description</h1>
        <p>Prompt describing the simulation</p>
      </TextField>
      <Sequence elementBuilder={instanceBuilder}>
        <h1 className="font-bold">Instances</h1>
        <p>Parameters for each instance of the simulation</p>
      </Sequence>
      <AcceptButton onClick={generateSimulation}>Generate Simulation Configuration</AcceptButton>
      <AcceptButton onClick={runSimulation}>Run Simulation</AcceptButton>
    </div>
  );
};

export default Configurator;
