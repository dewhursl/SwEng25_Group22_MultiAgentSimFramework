import { useState } from 'react';
import Navbar from './components/Navbar';

const Element = ({ onRemove }) => {
  return (
    <>
      <h1>I'm an element!</h1>
      <button onClick={onRemove}>Remove</button>
    </>
  );
};

const Sequence = ({}) => {
  const [elements, setElements] = useState([]);

  const handleRemove = (index) => {
    setElements((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const handleAdd = () => {
    setElements((prev) => [...prev, <Element onRemove={() => handleRemove(prev.length)} />]);
  };

  return (
    <>
      <button onClick={handleAdd}>Add Element</button>
      <div>
        {elements.map((element, index) => (
          <div key={index}>{element}</div>
        ))}
      </div>
    </>
  );
};

const Configurator = () => {
  return (
    <div className="text-white">
      <Sequence />
    </div>
  );
};

export default Configurator;

// const appendToStateArray = (setState, element) => {
//   setState((prev) => [...prev, element]);
// };

// const removeFromStateArray = (setState, index) => {
//   setState((prev) => {
//     const next = [...prev];
//     next.splice(index, 1);
//     return next;
//   });
// };

// const handleInput = (setState, event) => {
//   setState(event.target.value);
// };

// const Parameter = () => {
//   const [name, setName] = useState('');
//   const [value, setValue] = useState('');

//   return (
//     <div className="bg-gray-900 p-4 rounded-xl shadow-md space-y-4 text-white">
//       <label htmlFor="name" className="block text-gray-300 font-semibold">
//         Name
//       </label>
//       <input
//         className="w-full p-2 border border-gray-600 bg-gray-800 text-white rounded-md"
//         name="name"
//         type="text"
//         defaultValue={name}
//         onChange={(event) => handleInput(setName, event)}
//       ></input>

//       <label htmlFor="value" className="block text-gray-300 font-semibold">
//         Value
//       </label>
//       <input
//         className="w-full p-2 border border-gray-600 bg-gray-800 text-white rounded-md"
//         name="value"
//         type="text"
//         defaultValue={value}
//         onChange={(event) => handleInput(setValue, event)}
//       ></input>
//     </div>
//   );
// };

// const Agent = () => {
//   const [name, setName] = useState('');
//   const [description, setDescription] = useState('');
//   const [freePrompt, setFreePrompt] = useState('');
//   const [parameters, setParameters] = useState([]);

//   return (
//     <div className="bg-gray-900 p-4 rounded-xl shadow-md space-y-4 text-white">
//       <label htmlFor="name" className="block text-gray-300 font-semibold">
//         Name
//       </label>
//       <input
//         className="w-full p-2 border border-gray-600 bg-gray-800 text-white rounded-md"
//         name="name"
//         type="text"
//         defaultValue={name}
//         onChange={(event) => handleInput(setName, event)}
//       ></input>

//       <label htmlFor="description" className="block text-gray-300 font-semibold">
//         Description
//       </label>
//       <input
//         className="w-full p-2 border border-gray-600 bg-gray-800 text-white rounded-md"
//         name="description"
//         type="text"
//         defaultBalue={description}
//         onChange={(event) => handleInput(setDescription, event)}
//       ></input>

//       <label htmlFor="free-prompt" className="block text-gray-300 font-semibold">
//         Free Prompt
//       </label>
//       <input
//         className="w-full p-2 border border-gray-600 bg-gray-800 text-white rounded-md"
//         name="free-prompt"
//         type="text"
//         defaulValue={freePrompt}
//         onChange={(event) => handleInput(setFreePrompt, event)}
//       ></input>

//       <button
//         className="block px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
//         onClick={() => appendToStateArray(setParameters, <Parameter />)}
//       >
//         Add Parameter
//       </button>

//       <div>
//         {parameters.map((parameter, index) => (
//           <div className="bg-gray-800 p-2 rounded-md" key={index}>
//             <div className="flex items-center justify-between">
//               <p>Parameter {index}</p>
//               <button
//                 className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
//                 onClick={() => removeFromStateArray(setParameters, index)}
//               >
//                 Remove
//               </button>
//             </div>
//             {parameter}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// const Simulation = () => {
//   const [numRuns, setNumRuns] = useState(0);
//   const [agents, setAgents] = useState([]);

//   return (
//     <div className="bg-gray-900 p-4 rounded-xl shadow-md space-y-4">
//       <label htmlFor="num-runs" className="block text-gray-300 font-semibold">
//         Number of Runs
//       </label>
//       <input
//         className="w-full p-2 border border-gray-600 bg-gray-800 text-white rounded-md"
//         name="num-runs"
//         type="number"
//         defaultValue={numRuns}
//         onChange={(event) => handleInput(setNumRuns, event)}
//       />

//       <button
//         className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
//         onClick={() => appendToStateArray(setAgents, <Agent />)}
//       >
//         Add Agent
//       </button>

//       <div className="">
//         {agents.map((agent, index) => (
//           <div key={index} className="bg-gray-800 p-2 rounded-md">
//             <div className="flex items-center justify-between">
//               <p className="text-white">Agent {index}</p>
//               <button
//                 className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
//                 onClick={() => removeFromStateArray(setAgents, index)}
//               >
//                 Remove
//               </button>
//             </div>
//             {agent}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// const Configurator = () => {
//   const [simulations, setSimulations] = useState([]);

//   return (
//     <div className="p-6 pt-28 mb-8 bg-midnight min-h-screen overflow-y-auto">
//       <Navbar />
//       <button
//         className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
//         onClick={() => appendToStateArray(setSimulations, <Simulation />)}
//       >
//         Add Simulation
//       </button>

//       <div className="mt-4 space-y-4">
//         {simulations.map((simulation, index) => (
//           <div key={index} className="bg-gray-800 p-4 rounded-xl shadow-md">
//             <div className="flex items-center justify-between mb-2">
//               <p className="text-white font-semibold">Simulation {index}</p>
//               <button
//                 className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
//                 onClick={() => removeFromStateArray(setSimulations, index)}
//               >
//                 Remove
//               </button>
//             </div>
//             {simulation}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Configurator;
