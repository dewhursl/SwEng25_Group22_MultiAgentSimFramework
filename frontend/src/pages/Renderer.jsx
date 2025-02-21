import React, { useState } from "react";
import { SIMULATION_DATA } from "../constants/simulationData";
import Scene2D from "./components/Scene2D";
import Scene3D from "./components/Scene3D";
//import Scene2D2 from "./components/2D2/index";

const Renderer = () => {
  // Here, we can fetch data from an API in future

  // We are using mock data here
  const data = SIMULATION_DATA;

  // Mock rendering context
  const [context, setContext] = useState("2d");

  // Toggle context
  const toggleContext = () => {
    setContext((prev) => (prev === "2d" ? "3d" : "2d"));
  };

  const getScene = () => {
    switch (context) {
      case "2d":
        return <Scene2D />;
      case "3d":
        return <Scene3D simulationData={data} />;
      default:
        return <></>;
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center h-screen mx-auto">
      <button
        onClick={toggleContext}
        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
      >
        {context === "2d" ?  "Switch to 3D" : "Switch to 2D"} Render
      </button>
      {getScene()}
    </div>
  );
};

export default Renderer;  	

