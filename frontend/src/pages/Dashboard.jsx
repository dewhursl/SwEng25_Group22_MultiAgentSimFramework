import { useState } from "react";

const Parameter = () => {
    const [name, setName] = useState("");
    const [value, setValue] = useState("");

    return (
        <>
            <label htmlFor="name">Name</label>
            <input 
                className="border border-violet-500 text-white rounded-lg p2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-blue-500"
                name="name"
                type="text"
                defaultValue={name}
                onChange={(event) => setName(event.target.value)}
            ></input>

            <label htmlFor="value">Value</label>
            <input 
                className="border border-violet-500 text-white rounded-lg p2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-blue-500"
                name="value"
                type="text"
                defaultValue={value}
                onChange={(event) => setValue(event.target.value)}
            ></input>
        </>
    );
}

const Agent = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [parameters, setParameters] = useState([]);

    const addParameter = () => {
        setParameters((prev) => [...prev, <Parameter />]);
    };

    const removeParameter = (index) => {
        const newParameters = [...parameters];
        newParameters.splice(index, 1);
        setParameters(newParameters);
    };

    return (
        <>
            <label htmlFor="name">Name</label>
            <input 
                className="border border-violet-500 text-white rounded-lg p2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-blue-500"
                name="name"
                type="text"
                defaultValue={name}
                onChange={(event) => setName(event.target.value)}
            ></input>

            <label htmlFor="description">Name</label>
            <input 
                className="border border-violet-500 text-white rounded-lg p2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-blue-500"
                name="description"
                type="text"
                defaultValue={description}
                onChange={(event) => setDescription(event.target.value)}
            ></input>

            <button 
                className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:shadow-button hover:cursor-pointer"
                onClick={addParameter}
            >
                Add Parameter
            </button>

            {parameters.map((parameter, index) => (
                <div key={index}>
                    <p>Parameter {index}</p>
                    {parameter}
                    <button 
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:shadow-button hover:cursor-pointer"
                        onClick={(index) => removeParameter(index)}
                    >
                        Remove Parameter
                    </button>

                </div>
            ))};

            <h1>Agent Data</h1>
        </>
    )
}

const Simulation = () => {
    const [numRuns, setNumRuns] = useState(0);
    const [agents, setAgents] = useState([]);

    const addAgent = () => {
        setAgents((prev) => [...prev, <Agent />]);
    }

    const removeAgent = (index) => {
        const newAgents = [...agents];
        newAgents.splice(index, 1);
        setAgents(newAgents);
    }

    return (
        <>
            <label htmlFor="numRuns">Number of Runs</label>
            <input 
                className="border border-violet-500 text-white rounded-lg p2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-blue-500"
                name="numRuns"
                type="number"
                defaultValue={numRuns}
                onChange={(event) => setNumRuns(event.target.value)}
            ></input>

            <p>Number of Agents: {agents.length}</p>
            
            <button 
                className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:shadow-button hover:cursor-pointer"
                onClick={addAgent}
            >
                Add Agent
            </button>

            {agents.map((agent, index) => (
                <div key={index}>
                    <p>Agent {index}</p>
                    {agent}
                    <button
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:shadow-button hover:cursor-pointer"
                        onClick={(index) => removeAgent(index)}
                    >
                        remove Agent
                    </button>
                </div>
            ))}
        </>
    )
}

const Dashboard = () => {
    const [simulations, setSimulations] = useState([]);

    const addSimulation = () => {
        console.log("Add simulation");
        setSimulations((prev) => [...prev, <Simulation />]);
    };

    const removeSimulation = (index) => {
        const newSimulations = [...simulations];
        newSimulations.splice(index, 1);
        setSimulations(newSimulations);
    };

    return (
        <div className="text-white">
            <button 
                className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:shadow-button hover:cursor-pointer" 
                onClick={addSimulation}
            >
                Add Simulation
            </button>
            <div>
                {simulations.map((simulation, index) => (
                    <div key={index}>
                        <p>Simulation {index}</p>
                        {simulation}
                        <button 
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:shadow-button hover:cursor-pointer"
                            onClick={(index) => removeSimulation(index)}
                        >
                            Remove Simulation
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;