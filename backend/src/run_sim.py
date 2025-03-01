import sys
import uuid
import asyncio

from dotenv import load_dotenv
load_dotenv()

from sim.monte_carlo import MonteCarloSimulator
from util.database_api import DataBaseAPI
from util.sim_results_handler import SimResultsHandler

USAGE_MESSAGE = f'Usage: {sys.argv[0]} <int: num_runs> <str: sim_config_name>'

def main():
    if len(sys.argv) != 3:
        print(USAGE_MESSAGE)
        sys.exit(1)

    try:
        num_runs = int(sys.argv[1])
    except ValueError:
        print(USAGE_MESSAGE)
        sys.exit(1)

    sim_config_file = f'{sys.argv[2]}.json'
    
    try:
        sim = MonteCarloSimulator(sim_config_file, num_runs=num_runs)
    except FileNotFoundError:
        print(f'File {sim_config_file} doesn\'t exist in sim_configs!')
        sys.exit(1)

    db = DataBaseAPI('27017')

    results = asyncio.run(sim.run_monte_carlo())

    SimResultsHandler.log_sim_results(results)

    sim_id = str(uuid.uuid4())[:8]
    json_results = SimResultsHandler.sim_results_to_json(results, sim_id)
    db.insert_output(json_results)

    print(f'\nSimulation ID: {sim_id}')


if __name__ == "__main__":
    main()