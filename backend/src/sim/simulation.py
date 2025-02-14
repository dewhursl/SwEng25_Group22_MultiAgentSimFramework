from util.config import SimConfigLoader

import re
import os
import asyncio

from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.conditions import MaxMessageTermination, TextMentionTermination
from autogen_agentchat.teams import SelectorGroupChat
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient

TEMP_AGENT_MODEL_TYPE = "Ollama" # Remove
TEMP_INFO_MODEL_TYPE = "Ollama" # Remove
TEMP_GC_MODEL_TYPE = "Ollama" # Remove

def init_gpt_model_client():
    return OpenAIChatCompletionClient(
            model="gpt-4o",
            api_key=os.environ["OPENAI_API_KEY"]
        )   

def init_together_model_client():
    return OpenAIChatCompletionClient(
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


def select_model(type: str, gpt_model, together_model, ollama_model):
    if (type == "GPT"):
        return gpt_model
    elif (type == "Together"):
        return together_model
    elif (type == "Ollama"):
        return ollama_model
    assert(False) # Change this to throw exception, can't be bothered to look up how rn

class Simulation:
    def __init__(self, sim_config_file_name, max_messages=25):

        print("Initialising model client")

        model_list = [ TEMP_AGENT_MODEL_TYPE, TEMP_INFO_MODEL_TYPE, TEMP_GC_MODEL_TYPE ]
        gpt_model_client = None
        together_model_client = None
        ollama_model_client = None

        if (model_list.__contains__("GPT")):
            gpt_model_client = init_gpt_model_client()
        if (model_list.__contains__("Together")):
            together_model_client = init_together_model_client()
        if (model_list.__contains__("Ollama")):
            ollama_model_client = init_ollama_model_client()

        self.agent_model_client = select_model(TEMP_AGENT_MODEL_TYPE, gpt_model_client, together_model_client, ollama_model_client)
        self.info_model_client = select_model(TEMP_INFO_MODEL_TYPE, gpt_model_client, together_model_client, ollama_model_client)
        self.gc_model_client = select_model(TEMP_GC_MODEL_TYPE, gpt_model_client, together_model_client, ollama_model_client)

        print("Loading config file: " + sim_config_file_name)
        
        self.config = SimConfigLoader(sim_config_file_name).load()

        print("Setting up AutoGen Agents")

        self.agents = [
            AssistantAgent(
                agent["name"],
                description=agent["description"],
                model_client=self.agent_model_client,
                system_message=agent["system_message"]
            ) for agent in self.config["agents"]
        ]
        
        print("Setting up InformationReturnAgent")

        information_return_agent = AssistantAgent(
            "InformationReturnAgent",
            description="An agent that returns information about the conversation when the specified termination condition is reached.",
            model_client=self.info_model_client,
            system_message=(
                f"Do not act like a human.\n"
                f"You are a system that extracts the following information from the conversation when the termination condition: \"{self.config['termination_condition']}\" is satisfied:\n\n"
                f"{'\n'.join([f'{v['name']} # {v['type']}' for v in self.config['output_variables']])}\n\n"
                f"Make sure the output is valid python code, and the variables are assigned to exact values (not expessions).\n\n"
                f"After this, send 'TERMINATE'\n"
            )
        )
        self.agents.append(information_return_agent)

        print("Setting up SelectorGroupChat")

        self.gc = SelectorGroupChat(
            self.agents,
            model_client=self.gc_model_client,
            termination_condition=(
                TextMentionTermination("TERMINATE") | MaxMessageTermination(max_messages=max_messages)
            )
        )

    def run(self):
        asyncio.run(Console(self.gc.run_stream()))

    # def parse_output_variables(self):
    #     results = {}
        
    #     lines = message.splitlines()
    #     filtered_lines = []
        
    #     for line in lines:
    #         if not any(re.search(rf"{vname}\s*=", line) for vname in output_variables):
    #             filtered_lines.append(line)
            
    #     full_match = True
    #     partial_match = False

    #     for vname, vtype in output_variables.items():
    #         str_pattern = rf"{vname}\s*=\s*\"(.*?)\""
    #         num_pattern = rf"{vname}\s*=\s*(\d+)"
            
    #         str_match = re.search(str_pattern, message)
    #         num_match = re.search(num_pattern, message)
            
    #         if vtype == "String":
    #             results[vname] = str_match.group(1) if str_match else None
    #         elif vtype == "Number":
    #             results[vname] = int(num_match.group(1)) if num_match else None

    #         if results[vname] == None:
    #             full_match = False
    #         else:
    #             partial_match = True
        
    #     return results, partial_match, full_match