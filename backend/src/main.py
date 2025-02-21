import ipdb
import asyncio

from dotenv import load_dotenv
load_dotenv()

from sim.monte_carlo import MonteCarloSimulator

from sim.simulation import Simulation

def main():
    monte_carlo = MonteCarloSimulator("car_sale_simulation.json", num_runs=2)
    results = asyncio.run(monte_carlo.run_monte_carlo())
    print(results)

    # ipdb.set_trace()

if __name__ == "__main__":
    main()