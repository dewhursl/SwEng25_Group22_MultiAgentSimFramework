import React, { useState, useEffect } from 'react';
import { SIMULATION_DATA } from '../constants/simulationData';
import Scene3D from './components/Scene3D';
import Scene2D2 from './components/2D2/index';
import Navbar from './components/Navbar';
import conversationData from '../constants/conversation.json'; // Import JSON file
import apiService from '../services/apiService'; 

const Renderer = () => {
  const data = SIMULATION_DATA;
  const [simulationId, setSimulationId] = useState('');
  const [context, setContext] = useState('2d');
  const [conversation, setConversation] = useState([]);
  const [isPaused, setIsPaused] = useState(true);
  const [isSimulationOver, setIsSimulationOver] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [selectedRun, setSelectedRun] = useState(0); // State to track selected simulation run
  const [isOpeningScreenVisible, setIsOpeningScreenVisible] = useState(true); // State for opening screen visibility
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');



  // Fetch conversation data based on the simulation ID (API request or local JSON)
  useEffect(() => {
    const fetchConversation = async () => {
      if (simulationId=='saved') {
        // Use local saved simulation data (e.g., from the conversation.json file)
        const formattedConversation = conversationData.runs[selectedRun].messages.map(msg => ({
          agent: msg.agent,
          message: msg.message,
        }));
        setConversation(formattedConversation);
      }
    };

    fetchConversation();
  }, [simulationId, selectedRun]);


  // Handle Simulation ID input change
  const handleSimulationIdChange = (event) => {
    setSimulationId(event.target.value);
  };

  // Handle saved simulation selection
  const handleSavedSimulation = () => {
    setSimulationId('saved');
    setIsOpeningScreenVisible(false);
  };

  // Hide the opening screen when the simulation ID is entered or a saved simulation is selected
  const handleStartSimulation = async () => {
    if (!simulationId) {
      setError("Simulation ID cannot be empty."); // Set error message
    }
    try {
      // Make an API call to check if the simulation exists
      const response = await fetch(`http://localhost:5000/sim/results?id=${simulationId}&show_messages=yes`);

      if (!response.ok) {
        throw new Error("Simulation not found."); // If the response is not ok, throw an error
      }

      // If the simulation is found, proceed with starting the simulation
      setError(""); // Clear any previous errors
      console.log("Starting simulation with ID:", simulationId);
      setIsOpeningScreenVisible(false); // Hide the opening screen

      const data = await response.json();
      
      const formattedConversation = data.runs.flatMap(run => run.messages || []);
      setConversation(formattedConversation);

      // Further steps to handle the simulation data
    } catch (error) {
      // Catch any errors (e.g., simulation not found)
      setError("Simulation ID does not exist. Please check the ID and try again.");
    }
  };
      


  useEffect(() => {
    let messageInterval;
    if (!isPaused && !isSimulationOver) {
      messageInterval = setInterval(() => {
        setCurrentMessageIndex((prevIndex) => {
          if (prevIndex + 1 >= conversationData.runs[selectedRun].num_messages) {
            clearInterval(messageInterval);
            setIsSimulationOver(true);
            setIsPaused(true);
            return prevIndex;
          }
          return prevIndex + 1;
        });
      }, 2000);
    }
    return () => clearInterval(messageInterval);
  }, [selectedRun, isPaused, isSimulationOver, conversation]);

  const handleRestart = () => {
    setCurrentMessageIndex(0);
    setIsSimulationOver(false);
  };

  const handleTogglePlayPause = () => {
    if (isPaused && !isSimulationOver) {
      // Start the game (unpause)
      setIsPaused(false);
      window.isSimPaused = false; // Set global variable to resume the game
    } else {
      // Pause the game
      setIsPaused(true);
      window.isSimPaused = true; // Set global variable to pause the game
    }
  };

  // Toggle context (2D or 3D)
  const toggleContext = () => {
    setContext((prev) => (prev === '2d' ? '3d' : '2d'));
  };   

  const togglePanel = () => {
    setIsPanelVisible((prev) => !prev);
  };
  
  // Function to render the appropriate scene
  const getScene = () => {
    switch (context) {
      case '2d':
        return <Scene2D2 key={`2d-${Date.now()}`} />;
      case '3d':
        return <Scene3D simulationData={data} />;
      default:
        return <></>;
    }
  };

  const handleNextMessage = () => {
    if (currentMessageIndex + 2 < conversationData.runs[selectedRun].num_messages) {
      setCurrentMessageIndex(currentMessageIndex + 1);
    } else {
      setIsSimulationOver(true);
      setIsPaused(true);
    }
  };

  const handlePrevMessage = () => {
    if (currentMessageIndex > 0) {
      setCurrentMessageIndex(currentMessageIndex - 1);
    }
  };

  // Handle run selection from dropdown
  const handleRunChange = (event) => {
    const selectedRunIndex = event.target.value;
    setSelectedRun(selectedRunIndex);
  };

  

  return (
    <div className={`w-full flex flex-col mb-2 h-screen`}>
      <Navbar />

    {/* Opening Screen */}
    {isOpeningScreenVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-10 w-96 md:w-1/2 lg:w-1/3 min-h-[300px] flex flex-col justify-center rounded-xl shadow-2xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Enter Simulation ID</h2>
            <p className="text-lg text-gray-600 mt-4">Please enter a simulation ID</p>

            {/* Input Simulation ID */}
            <input
              type="text"
              value={simulationId}
              onChange={handleSimulationIdChange}
              placeholder="Enter Simulation ID"
              className="mt-4 p-2 border rounded"
            />

            {/* Buttons */}
            <div className="mt-4 space-x-4">
              <button
                onClick={handleStartSimulation}
                className="bg-violet-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-violet-700"
              >
                See Simulation
              </button>

              <button
                onClick={handleSavedSimulation}
                className="bg-violet-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-violet-700"
              >
                See Saved Simulation
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Toggle Button */}
      <button
        onClick={toggleContext}
        className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center z-10"
      >
        {context === '2d' ? 'Switch to 3D' : 'Switch to 2D'} Render
      </button>

      {/* Dropdown for selecting simulation run */}
      <div className="absolute top-20 left-1/4 transform -translate-x-1/2 z-10">
        <select
          value={selectedRun}
          onChange={handleRunChange}
          className="bg-white text-gray-800 font-bold py-2 px-4 rounded border"
        >
          {conversationData.runs.map((run, index) => (
            <option key={index} value={index}>
              {`Run ${index + 1}`}
            </option>
          ))}
        </select>
      </div>



      {/* Scene and side Panel */}
      <div className="flex flex-row flex-1 w-full mt-16 overflow-hidden">
        {/* Scene Container (takes remaining space) */}
        <div className="flex flex-1 flex-col justify-center items-center relative">
          {getScene()}
        </div>


        {/* Playback Controls */}
        {context === '2d' && (
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-6">

          <button
            onClick={handleRestart}
            className="bg-violet-600 text-white px-4 py-2 rounded shadow-md hover:bg-violet-700"
          >
            ↺
          </button>

          {/* Step buttons */}
          <button
            onClick={handlePrevMessage}
            className="bg-violet-600 text-white px-4 py-2 rounded shadow-md hover:bg-violet-700"
          >
            «  
          </button>

          <button
            onClick={handleTogglePlayPause}
            className="bg-violet-600 text-white px-4 py-2 rounded shadow-md hover:bg-violet-700"
          >
            {isPaused ? '▶' : '⏸'}
          </button>

          <button
            onClick={handleNextMessage}
            className="bg-violet-600 text-white px-4 py-2 rounded shadow-md hover:bg-violet-700"
          >
            » 
          </button>

        </div>
        )}
                
        {/* Panel Toggle Button */}
        <button
          onClick={togglePanel}
          className={`fixed top-20 ${isPanelVisible ? 'right-110' : 'right-5'} 
            bg-white hover:bg-gray-300  font-bold px-4 py-2 rounded shadow-md z-20`}
        >
          ☰
        </button>

        

        {/* side Conversation Panel (only visible in 2D render) */}
        {context === '2d' && isPanelVisible && (
          <div className="w-120 max-h-screen bg-midnight p-4 overflow-y-auto border shadow-lg shadow-violet-600/60">
            
            
            <h2 className="text-lg font-bold mt-15 mb-2 text-white">Conversation</h2>
            
            <div className="space-y-4">
              {conversation.slice(0, currentMessageIndex + 1)
              .filter((msg) => msg.agent !== 'InformationReturnAgent' || !msg.message.includes('TERMINATE'))
              .map((msg, index) => (
                <div key={index} className="flex items-start space-x-4">
                  {/* Avatar Circle */}
                  <div className="min-w-10 w-10 h-10 flex-shrink-0 flex justify-center items-center bg-gray-500 rounded-full overflow-hidden">
                    <img
                      src={`/images/${msg.agent === 'CarSalesman' ? 'salesman.png' : 'customer.png'}`}
                      alt={`${msg.agent} Avatar`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Message */}
                  <div className="flex-grow p-2 bg-violet-950/20 border border-violet-400 rounded-lg">
                    <p className="text-sm text-gray-200">
                      <strong className="text-white">{msg.agent}:</strong> {msg.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

     {/* Simulation Over Message */}
     {isSimulationOver && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-10 w-96 md:w-1/2 lg:w-1/3 min-h-[300px] flex flex-col justify-center rounded-xl shadow-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Simulation Over</h2>
          <p className="text-lg text-gray-600 mt-4">The conversation has ended.</p>
          
          {/* Check for the selected run's output variables */}
      {conversationData.runs[selectedRun]?.output_variables && (
        <div className="mt-6 text-sm text-gray-700">
          <h3 className="font-bold text-gray-800">End result:</h3>
          {/* Loop through output variables and display them dynamically */}
          {conversationData.runs[selectedRun].output_variables.map((output, index) => (
            <div key={index}>
              <p><strong>{output.name.replace('_', ' ').toUpperCase()}:</strong> {output.value}</p>
            </div>
          ))}
        </div>
      )}
          
          
          <button
            onClick={handleRestart}
            className="mt-6 bg-violet-600 text-white text-lg px-6 py-3 rounded-lg shadow-lg hover:bg-violet-700"
          >
            Restart
          </button>
        </div>
      </div>
    )}

    </div>
  );
};

export default Renderer;
