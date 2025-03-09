import os
import re
import sys
import time
import json
import signal
import asyncio
import concurrent.futures
from pymongo import MongoClient

from dotenv import load_dotenv
load_dotenv()

from db.simulation_queue import SimulationQueue
from db.simulation_results import SimulationResults
from db.simulation_catalog import SimulationCatalog
from engine.simulation import SelectorGCSimulation

mongo_client = MongoClient(os.environ["DB_CONNECTION_STRING"])
simulation_queue = SimulationQueue(mongo_client)
simulation_results = SimulationResults(mongo_client)
simulation_catalog = SimulationCatalog(mongo_client)

executor = None

def signal_handler(sig, frame):
    print("\nTermination signal received. Shutting down...")
    if executor:
        executor.shutdown(wait=False, cancel_futures=True)
    sys.exit(0)

def process_result(simulation_result):
    if len(simulation_result.messages) < 5:
        return None

    messages = []
    for message in simulation_result.messages:
        messages.append({"agent": message.source, "message": message.content})
    
    output_variables = []
    information_return_agent_message = messages[-1]["message"]
    json_match = re.search(r'\{.*\}', information_return_agent_message, re.DOTALL)
    if json_match:
        try:
            parsed_json = json.loads(json_match.group(0))
            for variable in parsed_json:
                if parsed_json[variable] != None:
                    output_variables.append({"name": variable, "value": parsed_json[variable]})
                else:
                    return None
        except json.JSONDecodeError:
            return None
    else:
        return None
    
    return {"messages": messages, "output_variables": output_variables}

async def run_simulation(simulation_id, simulation_config):
    print(f"Starting run for simulation ID: {simulation_id}...")
    simulation = SelectorGCSimulation(simulation_config)
    simulation_result = await simulation.run()
    processed_results = process_result(simulation_result)
    if processed_results:
        print(f"Saving results for run of simulation ID: {simulation_id}...", end="")
        simulation_results.insert(simulation_id, processed_results)
        simulation_catalog.update_progress(simulation_id)
        print(" Done!")
    else:
        print(f"Run failed! Queueing retry run for simulation ID {simulation_id}...", end="")
        simulation_queue.insert_with_id(simulation_id, simulation_config, 1)
        print(" Done!")

def start_simulation(simulation_id, simulation_config):
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(run_simulation(simulation_id, simulation_config))
    except RuntimeError:
        print(f"Run failed! Queueing retry run for simulation ID {simulation_id}...", end="")
        simulation_queue.insert_with_id(simulation_id, simulation_config, 1)
        print(" Done!")

def orchestrator(max_threads=4):
    print("Listening for simulations...")

    global executor
    signal.signal(signal.SIGINT, signal_handler)
    executor = concurrent.futures.ThreadPoolExecutor(max_workers=max_threads)
    future_to_id = {}
    try:
        while True:
            next_simulation = simulation_queue.retrieve_next()
            
            if next_simulation:
                future = executor.submit(start_simulation, next_simulation[0], next_simulation[1])
                future_to_id[future] = next_simulation[0]
            
            done_futures = [f for f in future_to_id if f.done()]
            for f in done_futures:
                del future_to_id[f]
            
            time.sleep(5)
    except SystemExit:
        pass