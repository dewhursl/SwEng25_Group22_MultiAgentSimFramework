import { useState } from "react";

const appendToStateArray = (setState, element) => {
    setState((prev) => [...prev, element]);
}

const removeFromStateArray = (setState, index) => {
    setState((prev) => {
        const next = [...prev];
        next.splice(index, 1);
        return next;
    });
}

const Agent = () => {
    return <p className="text-white bg-gray-700 p-2 rounded-md">I'm an agent</p>;
}

const Simulation = () => {
    const [numRuns, setNumRuns] = useState(0);
    const [agents, setAgents] = useState([]);

    return (
        <div className="bg-gray-900 p-4 rounded-xl shadow-md space-y-4">
            <label htmlFor="num-runs" className="block text-gray-300 font-semibold">
                Number of Runs
            </label>
            <input
                className="w-full p-2 border border-gray-600 bg-gray-800 text-white rounded-md"
                name="num-runs"
                type="number"
                value={numRuns}
                onChange={(event) => setNumRuns(event.target.value)}
            />

            <button
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                onClick={() => appendToStateArray(setAgents, <Agent />)}
            >
                Add Agent
            </button>

            <div className="space-y-2">
                {agents.map((agent, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-800 p-2 rounded-md">
                        <p className="text-white">Agent {index}</p>
                        <button
                            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                            onClick={() => removeFromStateArray(setAgents, index)}
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

const Configurator = () => {
    const [simulations, setSimulations] = useState([]);

    return (
        <div className="p-6 bg-midnight min-h-screen">
            <button
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                onClick={() => appendToStateArray(setSimulations, <Simulation />)}
            >
                Add Simulation
            </button>

            <div className="mt-4 space-y-4">
                {simulations.map((simulation, index) => (
                    <div key={index} className="bg-gray-800 p-4 rounded-xl shadow-md">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-white font-semibold">Simulation {index}</p>
                            <button
                                className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                onClick={() => removeFromStateArray(setSimulations, index)}
                            >
                                Remove
                            </button>
                        </div>
                        {simulation}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Configurator;