# This file will be for constants and other settings like which model to use, toggling profiling options, etc

# Debugging
PROFILING_ENABLED = True;
PRINT_ALL_RESPONSE_DATA_ENABLED = False;
PRINT_RESPONSE_DURATIONS_ENABLED = True;

# LLM 
OLLAMA_MODEL = "llama3.2";

# Agents
AGENT_HOLD_CONTEXT_ENABLED = True; # Makes agents remember previous prompts and responses
AGENT_REMINDERS_ENABLED = True; # Reminds agents who they are before they respond

# Simulation
SIMULATION_TURN_LIMIT_ENABLED = True;
SIMULATION_TURN_LIMIT = 1;