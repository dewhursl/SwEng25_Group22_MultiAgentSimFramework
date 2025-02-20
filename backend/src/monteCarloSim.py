import asyncio
import numpy as np
from sim.simulation import Simulation  
from dotenv import load_dotenv
load_dotenv()

class MonteCarloSimulator:
    def __init__(self, sim_config_file_name, num_runs=5):
        self.num_runs = num_runs
        self.sim_config_file_name = sim_config_file_name
        self.results = []

    async def run_single_simulation(self):
        sim = Simulation(self.sim_config_file_name)
        async for _ in sim.gc.run_stream():
         pass  

        
         output_data = {   }        
        return output_data

    async def run_monte_carlo(self):
        tasks = [self.run_single_simulation() for _ in range(self.num_runs)]
        self.results = await asyncio.gather(*tasks)
        
        return self.results

    def analyze_results(self):
       # num_terminated = sum(1 for r in self.results if r["termination_reason"] == "TERMINATE")
        success_rate = 100

        print(f"Monte Carlo Results: {self.num_runs} runs completed.")
        print(f"Termination Rate: {success_rate * 100:.2f}%")

        return {"num_runs": self.num_runs, "success_rate": success_rate}


async def main():
    monte_carlo = MonteCarloSimulator("car_sale_simulation.json", num_runs=5)
    results = await monte_carlo.run_monte_carlo()
    stats = monte_carlo.analyze_results()
    print(stats)

if __name__ == "__main__":
    asyncio.run(main())
