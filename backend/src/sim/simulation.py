from util.config import SimConfigLoader

import re
import os
import asyncio

from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.conditions import MaxMessageTermination, TextMentionTermination
from autogen_agentchat.teams import SelectorGroupChat
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient

class Simulation:
    def __init__(self, sim_config_file_name, max_messages=25):

        # GPT-4o (OpenAI)
        self.gpt_model_client = OpenAIChatCompletionClient(
            model="gpt-4o",
            api_key=os.environ["OPENAI_API_KEY"]
        )

        # Llama-3.3-70B-Instruct-Turbo (Together.AI)
        try:
            self.llama_model_client = OpenAIChatCompletionClient(
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
        except KeyError:
            self.llama_model_client = self.gpt_model_client
        
        self.config = SimConfigLoader(sim_config_file_name).load()

        # Set up AutoGen agents
        self.agents = [
            AssistantAgent(
                agent["name"],
                description=agent["description"],
                model_client=self.llama_model_client,
                system_message=agent["system_message"]
            ) for agent in self.config["agents"]
        ]
        
        # Set up InformationReturnAgent
        self.agents.append(AssistantAgent(
            "InformationReturnAgent",
            description="An agent that returns information about the conversation when the specified termination condition is reached.",
            model_client=self.gpt_model_client,
            system_message=(
                f"Do not act like a human.\n"
                f"You are a system that extracts the following information from the conversation when the termination condition: \"{self.config['termination_condition']}\" is satisfied:\n\n"
                f"{'\n'.join([f'{v['name']} # {v['type']}' for v in self.config['output_variables']])}\n\n"
                f"Make sure the output is valid python code, and the variables are assigned to exact values (not expessions).\n\n"
                f"After this, send 'TERMINATE'\n"
            )
        ))

        self.gc = SelectorGroupChat(
            self.agents,
            model_client=self.gpt_model_client,
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