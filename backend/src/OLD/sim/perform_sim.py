import sys
import os

import openai
import promptlayer

from performance.promptlayer_code import PromptLayerOpenAIClient # Import PromptLayer
from dotenv import load_dotenv
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.conditions import MaxMessageTermination, TextMentionTermination
from autogen_agentchat.teams import SelectorGroupChat
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient
from OLD.util.config import SimConfigLoader

# Load environment variables
load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")
promptlayer.api_key = os.getenv("PROMPTLAYER_API_KEY")

# Ensure custom modules path is included
sys.path.append(os.path.abspath("/home/aine/sweng25/sweng25_group22_multiagentsimframework/backend/src"))

# Define PromptLayer integration with OpenAI
# Model initialization functions
def init_gpt_model_client():
    return PromptLayerOpenAIClient(
        model="gpt-4o",
        api_key=os.environ["OPENAI_API_KEY"]
    )

def init_together_model_client():
    return PromptLayerOpenAIClient(
        model="meta-llama/Llama-3.3-70B-Instruct-Turbo",
        base_url="https://api.together.xyz/v1",
        api_key=os.environ["TOGETHER_API_KEY"],
        model_info={
            "vision": False,
            "function_calling": True,
            "json_output": False,
            "family": "llama",
        },
    )

def init_ollama_model_client():
    return PromptLayerOpenAIClient(
        model="llama3.2:latest",
        base_url="http://localhost:11434/v1",
        api_key="placeholder",  # Replace with real key if available
        model_info={
            "vision": False,
            "function_calling": True,
            "json_output": False,
            "family": "llama",
        },
    )

# Function to select the model client
def select_model(type: str, gpt_model, together_model, ollama_model):
    if type == "GPT":
        return gpt_model
    elif type == "Together":
        return together_model
    elif type == "Ollama":
        return ollama_model
    raise Exception(f"Invalid model type: {type}")

# Simulation setup and execution class
class Simulation:
    def __init__(self, sim_config_file_name, max_messages=25):        
       
        self.config = SimConfigLoader("sim_configs").load()
        
        models = self.config['models']
        model_list = [models["agent"], models["info_return_agent"], models["group_chat"]]
        
        gpt_model_client = None
        together_model_client = None
        ollama_model_client = None

        if "GPT" in model_list:
            gpt_model_client = init_gpt_model_client()
        if "Together" in model_list:
            together_model_client = init_together_model_client()
        if "Ollama" in model_list:
            ollama_model_client = init_ollama_model_client()

        self.agent_model_client = select_model(models["agent"], gpt_model_client, together_model_client, ollama_model_client)
        self.info_model_client = select_model(models["info_return_agent"], gpt_model_client, together_model_client, ollama_model_client)
        self.gc_model_client = select_model(models["group_chat"], gpt_model_client, together_model_client, ollama_model_client)


        self.agents = [
            AssistantAgent(
                agent["name"],
                description=agent["description"],
                model_client=self.agent_model_client,
                system_message=agent["system_message"]
            ) for agent in self.config["agents"]
        ]
        
        output_variables_str = "{\n" + "\n".join([f"\"{v['name']}\": <{v['type']}>" for v in self.config['output_variables']]) + "\n}"

        information_return_agent = AssistantAgent(
            "InformationReturnAgent",
            description="An agent that returns information about the conversation when the specified termination condition is reached.",
            model_client=self.info_model_client,
            system_message=( 
                f"Do not act like a human.\n"
                f"You are a system that extracts the following information from the conversation when the termination condition: \"{self.config['termination_condition']}\" is satisfied:\n\n"
                f"{output_variables_str}\n\n"
                f"Make sure the output is valid JSON. Make sure that variables that contain information on the unit (e.g. kilometers) are assigned appropriate values, do a calculation if you have to.\n\n"
                f"After this, send 'TERMINATE'\n"
            )
        )

        self.agents.append(information_return_agent)


        self.gc = SelectorGroupChat(
            self.agents,
            model_client=self.gc_model_client,
            termination_condition=(
                TextMentionTermination("TERMINATE") | MaxMessageTermination(max_messages=max_messages)
            )
        )

    async def run(self):
        return await Console(self.gc.run_stream())