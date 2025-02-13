import React from "react";
import { SIMULATION_DATA } from "../constants/simulationData";
import Scene3D from "./components/Scene3D";

const Renderer = () => {
  // Here, we can fetch data from an API in future

  // We are using mock data here
  const data = SIMULATION_DATA;

  return (
    <div className="w-full items-center justify-center h-screen mx-auto">
      <Scene3D simulationData={data} />
    </div>
  );
};

export default Renderer;
