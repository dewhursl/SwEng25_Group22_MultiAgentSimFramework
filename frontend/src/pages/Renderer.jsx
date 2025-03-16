import React, { useState, useEffect } from 'react';
import { SIMULATION_DATA } from '../constants/simulationData';
import Scene3D from './components/Scene3D';
import Scene2D2 from './components/2D2/index';
import Navbar from './components/Navbar';
import conversationData from '../constants/conversation.json'; // Import JSON file

const Renderer = () => {
  // Fetch the data for simulation
  const data = SIMULATION_DATA;

  // State to control the current context (2D or 3D)
  const [context, setContext] = useState('2d');

  // State to hold all the conversation messages
  const [conversation, setConversation] = useState([]);

  const [isPaused, setIsPaused] = useState(true);

  // State to keep track of the index of the current message to show
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    // Flatten the conversation data
    const formattedConversation = conversationData.runs.flatMap((run) => run.chat_log);
    setConversation(formattedConversation);
  }, []);

  useEffect(() => {
    let messageInterval;
    if (!isPaused) {
      messageInterval = setInterval(() => {
        setCurrentMessageIndex((prevIndex) => {
          if (prevIndex + 1 >= conversation.length) {
            clearInterval(messageInterval);
            return prevIndex;
          }
          return prevIndex + 1;
        });
      }, 2000);
    }
    return () => clearInterval(messageInterval);
  }, [conversation.length, isPaused]);

  const handleRestart = () => {
    setCurrentMessageIndex(0);
  };

  const handleTogglePlayPause = () => {
    if (isPaused) {
      // Start the game (unpause)
      setIsPaused(false);
      window.isGamePaused = false; // Set global variable to resume the game
    } else {
      // Pause the game
      setIsPaused(true);
      window.isGamePaused = true; // Set global variable to pause the game
    }
  };

  // Toggle context (2D or 3D)
  const toggleContext = () => {
    setContext((prev) => (prev === '2d' ? '3d' : '2d'));
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
    if (currentMessageIndex + 1 < conversation.length) {
      setCurrentMessageIndex(currentMessageIndex + 1);
    }
  };

  const handlePrevMessage = () => {
    if (currentMessageIndex > 0) {
      setCurrentMessageIndex(currentMessageIndex - 1);
    }
  };


  return (
    <div className="w-full flex flex-col mb-2 h-screen overflow-hidden">
      <Navbar />

      {/* Toggle Button */}
      <button
        onClick={toggleContext}
        className="absolute top-25 left-1/2 transform -translate-x-1/2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center z-10"
      >
        {context === '2d' ? 'Switch to 3D' : 'Switch to 2D'} Render
      </button>

      {/* Scene and side Panel */}
      <div className="flex flex-row flex-1 w-full mt-16 overflow-hidden">
        {/* Scene Container (takes remaining space) */}
        <div className="flex flex-1 flex-col justify-center items-center relative">
          {getScene()}
        </div>

        {/* Playback Controls */}
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

        {/* side Conversation Panel (only visible in 2D render) */}
        {context === '2d' && (
          <div className="w-120 max-h-screen bg-midnight p-4 overflow-y-auto border shadow-lg shadow-violet-600/60">
            <h2 className="text-lg font-bold mt-4 mb-2 text-white">Conversation</h2>
            <div className="space-y-4">
              {conversation.slice(0, currentMessageIndex + 1).map((msg, index) => (
                <div key={index} className="flex items-start space-x-4">
                  {/* Avatar Circle */}
                  <div className="min-w-10 w-10 h-10 flex-shrink-0 flex justify-center items-center bg-gray-500 rounded-full overflow-hidden">
                    <img
                      src={`/images/${msg.agent === 'Salesman' ? 'salesman.png' : 'customer.png'}`}
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
    </div>
  );
};

export default Renderer;
