import sys
import uuid
import asyncio

from sim.monte_carlo import MonteCarloSimulator
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

    results = asyncio.run(sim.run_monte_carlo())

    sim_id = str(uuid.uuid4())[:8]

    print(SimResultsHandler.sim_results_to_json(results, sim_id))
    print(f'\nSimulation ID: {sim_id}')


if __name__ == "__main__":
    main()