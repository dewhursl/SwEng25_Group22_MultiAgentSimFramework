import asyncio
from prefect import flow, get_client
from multiprocessing import Process
from time import sleep, time
from flows.api_flow import api_flow  # Importing the API flow
from flows.sim_flow import simulation_flow  # Importing the simulation flow

async def fetch_task_stats():
    async with get_client() as client:
        flow_runs = await client.read_flow_runs()
        num_tasks = len(flow_runs)
        total_runtime = sum(run.total_run_time for run in flow_runs if run.total_run_time)
        print(f"Total Tasks Run: {num_tasks}")
        print(f"Total Running Time: {total_runtime} seconds")

def run_simulation_flow():
    sample_config = {
        "name": "Test Simulation",
        "agents": [{"name": "Agent1", "description": "First agent", "prompt": "Start"}],
        "termination_condition": "Condition Met",
        "output_variables": [{"name": "var1", "type": "Number"}]
    }
    num_runs = 5
    result = simulation_flow(config=sample_config, num_runs=num_runs)
    print("Simulation Flow Result:", result)

def run_api_flow():
    api_flow()  # Runs the API flow

@flow
def main_flow():
    print("Starting all flows...")
    start_time = time()
    
    # Run simulation in a separate process
    sim_process = Process(target=run_simulation_flow)
    sim_process.start()
    
    # Give some time before starting API flow
    sleep(5)
    run_api_flow()
    
    # Wait for simulation to finish
    sim_process.join()
    
    end_time = time()
    print(f"Total Execution Time: {end_time - start_time} seconds")
    
    asyncio.run(fetch_task_stats())
    
    print("All flows executed.")

if __name__ == "__main__":
    main_flow()