from util.config import SimConfigLoader

import re
import os
import asyncio
from datetime import datetime

AIRFLOW_ENABLED = False

if (AIRFLOW_ENABLED):
    from airflow import DAG
    from airflow.operators.python import PythonOperator

from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.conditions import MaxMessageTermination, TextMentionTermination
from autogen_agentchat.teams import SelectorGroupChat
from autogen_agentchat.ui import Console

import model_client

class Simulation:
    def __init__(self, sim_config_file_name, max_messages=25):        

        print("Loading config file: " + sim_config_file_name)        
        self.config = SimConfigLoader(sim_config_file_name).load()        

        print("Initialising model client")
        model_client.init_model_clients(self)

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
        output_variables_str="\n".join([f"{v['name']} # {v['type']}" for v in self.config['output_variables']])

        information_return_agent = AssistantAgent(
            "InformationReturnAgent",
            description="An agent that returns information about the conversation when the specified termination condition is reached.",
            model_client=self.info_model_client,
            system_message=(
                f"Do not act like a human.\n"
                f"You are a system that extracts the following information from the conversation when the termination condition: \"{self.config['termination_condition']}\" is satisfied:\n\n"
                f"{output_variables_str}\n\n"
                f"Make sure the output is valid Python code, and the variables are assigned to exact values (not expressions). Also, make sure that variables that contain information on the unit (e.g. kilometers) are assigned appropriate values, do a calculation if you have to.\n\n"
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

    #def run_airflow_task(self):
    #    with DAG(
    #        "simulation_task",
    #        schedule_interval=None,  
    #        start_date=datetime(2025, 2, 18),  
    #        catchup=False,
    #    ) as dag:
    #        sim_task = PythonOperator(
    #            task_id="sim_task",
    #            python_callable=run
    #        )
    #    sim_task
        import ipdb; ipdb.set_trace()

    if (AIRFLOW_ENABLED):
        with DAG(
        "simulation_task",
        schedule_interval=None,  
        start_date=datetime(2025, 2, 18),  
        catchup=False,
        ) as dag:
            sim_task = PythonOperator(
            task_id="sim_task",
            python_callable=run,
        )
        sim_task  

    print("this is my local change with remote changes")


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
