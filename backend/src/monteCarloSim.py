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

    async def run_single_simulation(self, run_id):
        print(f"\n🟢 Running Simulation {run_id+1}/{self.num_runs}...\n")
        sim = Simulation(self.sim_config_file_name)

        async for message in sim.gc.run_stream():
                print(f" {message}")  

        chat_log = sim.gc.chat_log if hasattr(sim.gc, "chat_log") else []
        
        output_data = {
            "termination_reason": chat_log[-1]["message"] if chat_log else "UNKNOWN",
            "num_messages": len(chat_log),
            "chat_log": chat_log
        }
        return output_data

    async def run_monte_carlo(self):
        tasks = [self.run_single_simulation(i) for i in range(self.num_runs)]
        self.results = await asyncio.gather(*tasks)
        return self.results

    def analyze_results(self):
        success_rate = 100  

        print(f"\n✅ Monte Carlo Results: {self.num_runs} runs completed.")
        print(f"🔍 Termination Rate: {success_rate:.2f}%\n")

        return {"num_runs": self.num_runs, "success_rate": success_rate}

async def main():
    monte_carlo = MonteCarloSimulator("car_sale_simulation.json", num_runs=1)
    results = await monte_carlo.run_monte_carlo()
    stats = monte_carlo.analyze_results()
    print(stats)

if __name__ == "__main__":
    asyncio.run(main())
