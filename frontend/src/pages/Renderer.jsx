import React from "react";
import { SIMULATION_DATA } from "../constants/simulationData";
import Scene2D from "./components/Scene2D";
import Scene3D from "./components/Scene3D";

const Renderer = () => {
  // Here, we can fetch data from an API in future

  // We are using mock data here
  const data = SIMULATION_DATA;

  // Mock rendering context
  const context = "3d";

  const getScene = () => {
    switch (context) {
      case "2d":
        return <Scene2D simulationData={data} />;
      case "3d":
        return <Scene3D simulationData={data} />;
      default:
        return <></>;
    }
  };

  return (
    <div className="w-full items-center justify-center h-screen mx-auto">
      {/* <Scene3D simulationData={data} /> */}
      {getScene()}
    </div>
  );
};

export default Renderer;
