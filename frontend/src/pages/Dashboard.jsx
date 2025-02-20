import { useState } from "react";

const Simulation = ({ id, remove }) => {
    return (
        <div>
            <h1>Simulation {id}</h1>
            <button 
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:shadow-button hover:cursor-pointer"
                onClick={(id) => remove(id)}
            >
                Remove
            </button>
        </div>
    );
}

const Dashboard = () => {
    const [simulations, setSimulations] = useState([]);

    const addSimulation = () => {
        setSimulations((prev) => [...prev, ""])
    }

    const removeSimulation = (id) => {
        const newSimulations = [...simulations];
        newSimulations.splice(id, 1);
        setSimulations(newSimulations);
    }

    return (
        <div className="text-white">
            <button className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:shadow-button hover:cursor-pointer" onClick={addSimulation}>Add Simulation</button>
            <div>
                {simulations.map(({}, index) => (
                    <Simulation key={index} id={index} remove={removeSimulation}/>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;