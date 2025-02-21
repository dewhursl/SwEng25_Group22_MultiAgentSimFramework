import asyncio

from dotenv import load_dotenv
load_dotenv()

from sim.monte_carlo import MonteCarloSimulator


def main():
    monte_carlo = MonteCarloSimulator("car_sale_simulation.json", num_runs=2)
    results = asyncio.run(monte_carlo.run_monte_carlo())
    print(results)


if __name__ == "__main__":
    main()