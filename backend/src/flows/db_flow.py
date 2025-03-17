from prefect import flow, task
from pymongo import MongoClient
from db.base import MongoBase
from db.simulation_results import SimulationResults

# MongoDB Configuration
MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "simulation_db"

# Initialize MongoDB Client
mongo_client = MongoClient(MONGO_URI)

def get_simulation_results():
    return SimulationResults(mongo_client)

@task
def insert_simulation_result(simulation_id: str, results: dict):
    db = get_simulation_results()
    inserted_id = db.insert(simulation_id, results)
    return inserted_id

@task
def retrieve_simulation_results(simulation_id: str):
    db = get_simulation_results()
    return db.retrieve(simulation_id)

@flow
def database_flow(simulation_id: str, results: dict):
    inserted_id = insert_simulation_result(simulation_id, results)
    retrieved_results = retrieve_simulation_results(simulation_id)
    return {
        "inserted_id": inserted_id,
        "retrieved_results": retrieved_results
    }

if __name__ == "__main__":
    sample_results = {
        "messages": [{"agent": "Agent1", "message": "Hello"}],
        "output_variables": [{"name": "var1", "value": "123"}]
    }
    result = database_flow("sim_001", sample_results)
    print(result)
