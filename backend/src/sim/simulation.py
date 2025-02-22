from util.config import SimConfigLoader

import re
import asyncio

from datetime import datetime

AIRFLOW_ENABLED = False

if (AIRFLOW_ENABLED):
    from airflow import DAG
    from airflow.operators.python import PythonOperator

from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.conditions import MaxMessageTermination, TextMentionTermination
from autogen_agentchat.teams import SelectorGroupChat # type: ignore
from autogen_agentchat.ui import Console

import sim.model_client as model_client

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

    async def run(self):
        return await Console(self.gc.run_stream())

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
    # import ipdb; ipdb.set_trace()

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