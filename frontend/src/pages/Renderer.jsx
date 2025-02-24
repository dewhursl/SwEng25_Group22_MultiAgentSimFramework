import React, { useState, useEffect } from 'react';
import { SIMULATION_DATA } from '../constants/simulationData';
import Scene2D from './components/Scene2D';
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

  // State to keep track of the index of the current message to show
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    // Flatten the conversation data
    const formattedConversation = conversationData.runs.flatMap((run) => run.chat_log);
    setConversation(formattedConversation);
  }, []);

  useEffect(() => {
    // timer to show each message one by one
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => {
        // If all messages are shown, stop interval
        if (prevIndex + 1 >= conversation.length) {
          clearInterval(messageInterval);
          return prevIndex;
        }
        return prevIndex + 1;
      });
    }, 3000); // 3000ms (3 seconds) interval

    return () => clearInterval(messageInterval);
  }, [conversation.length]);

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

  return (
    <div className="w-full mb-8 flex flex-col h-screen mx-auto">
      <Navbar />

      {/* Toggle Button */}
      <button
        onClick={toggleContext}
        className="absolute top-25 left-1/2 transform -translate-x-1/2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center z-10"
      >
        {context === '2d' ? 'Switch to 3D' : 'Switch to 2D'} Render
      </button>

      {/* Scene and side Panel */}
      <div className="flex flex-row flex-grow w-full mt-16">
        {/* Scene Container (takes remaining space) */}
        <div className="flex flex-1 justify-center items-center">{getScene()}</div>

        {/* side Conversation Panel (only visible in 2D render) */}
        {context === '2d' && (
          <div className="w-100 max-h-screen bg-midnight p-4 overflow-y-auto border-l shadow-md">
            <h2 className="text-lg font-bold mt-4 mb-2 text-white">Conversation</h2>
            <div className="space-y-4">
              {conversation.slice(0, currentMessageIndex + 1).map((msg, index) => (
                <div key={index} className="flex items-start space-x-4">
                  {/* Avatar Circle */}
                  <div className="w-8 h-8 flex justify-center items-center bg-gray-500 rounded-full overflow-hidden">
                    <img
                      src={`/images/${msg.agent === 'Salesman' ? 'salesman.png' : 'customer.png'}`}
                      alt={`${msg.agent} Avatar`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Message */}
                  <div className="flex-grow p-2 bg-gray-800 shadow rounded">
                    <p className="text-sm text-gray-300">
                      <strong className="text-white-400">{msg.agent}:</strong> {msg.message}
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
