import os
import sys
from prefect import flow, task

from dotenv import load_dotenv
load_dotenv()

sys.path.append("sweng25/sweng25_group22_multiagentsimframework/backend/src")

api_key = os.getenv("TOGETHER_API_KEY")

from OLD.util.config import SimConfigLoader
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.conditions import MaxMessageTermination, TextMentionTermination
from autogen_agentchat.teams import SelectorGroupChat
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient

@task
def init_gpt_model_client():
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable is not set.")
    
    return OpenAIChatCompletionClient(
        model="gpt-4o",
        api_key=api_key
    )

@task
def init_together_model_client():
    api_key = os.environ.get("TOGETHER_API_KEY")
    if not api_key:
        raise ValueError("TOGETHER_API_KEY environment variable is not set.")
    
    return OpenAIChatCompletionClient(
        model="meta-llama/Llama-3.3-70B-Instruct-Turbo",
        base_url="https://api.together.xyz/v1",
        api_key=api_key,
        model_info={
            "vision": False,
            "function_calling": True,
            "json_output": False,
            "family": "llama",
        },
    )

@task
def init_ollama_model_client():
    return OpenAIChatCompletionClient(
        model="llama3.2:latest",
        base_url="http://localhost:11434/v1",
        api_key="placeholder",
        model_info={
            "vision": False,
            "function_calling": True,
            "json_output": False,
            "family": "llama",
        },
    )

@task
def load_simulation_config(sim_config_file_name: str):
    return SimConfigLoader(sim_config_file_name).load()

@task
def setup_agents(config, agent_model_client, info_model_client, gc_model_client):
    agents = [
        AssistantAgent(
            agent["name"],
            description=agent["description"],
            model_client=agent_model_client,
            system_message=agent["system_message"]
        ) for agent in config["agents"]
    ]
    
    output_variables_str = "{\n" + "\n".join([f"\"{v['name']}\": <{v['type']}>" for v in config['output_variables']]) + "\n}"
    
    information_return_agent = AssistantAgent(
        "InformationReturnAgent",
        description="Returns information about the conversation when a termination condition is met.",
        model_client=info_model_client,
        system_message=(f"Do not act like a human.\n"
                        f"You are a system that extracts the following information from the conversation when the termination condition: \"{config['termination_condition']}\" is satisfied:\n\n"
                        f"{output_variables_str}\n\n"
                        f"Make sure the output is valid JSON and units are correct.\n\n"
                        f"After this, send 'TERMINATE'\n")
    )
    agents.append(information_return_agent)
    
    gc = SelectorGroupChat(
        agents,
        model_client=gc_model_client,
        termination_condition=(TextMentionTermination("TERMINATE") | MaxMessageTermination(max_messages=25))
    )
    
    return gc

@flow
def simulation_flow(sim_config_file_name: str):
    print("Starting simulation flow...")  # Debug log
    
    config = load_simulation_config(sim_config_file_name)
    print("Config loaded:", config)
    
    gpt_model = init_gpt_model_client()
    together_model = init_together_model_client()
    ollama_model = init_ollama_model_client()
    
    agent_model_client = gpt_model if "GPT" in config["models"].values() else together_model if "Together" in config["models"].values() else ollama_model
    info_model_client = agent_model_client
    gc_model_client = agent_model_client
    
    print("Setting up agents...")
    gc = setup_agents(config, agent_model_client, info_model_client, gc_model_client)
    print("Agents set up!")

    print("Running the conversation...")
    return Console(gc.run_stream())

if __name__ == "__main__":
    simulation_flow("sim_config.json")