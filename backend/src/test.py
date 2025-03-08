import os
import asyncio
from time import sleep
from pymongo import MongoClient

from dotenv import load_dotenv
load_dotenv()

from db.simulation_queue import SimulationQueue
from db.simulation_results import SimulationResults
from engine.simulation import SelectorGCSimulation

TEST_CONFIG = {
    "name": "Car Sale Simulation",
    "agents": [
        {
            "name": "Customer",
            "description": "Customer at a car dealership.",
            "prompt": "You are a customer at a car dealership trying to buy a car today. Your budget is $25000. Do not reveal your budget to the salesman. Ask about the car's make, model, mileage and price. Keep the conversation moving to a logical conclusion."
        },
        {
            "name": "CarSalesman",
            "description": "Salesman at a car dealership.",
            "prompt": "You are a salesman at a car dealership. Sell a car to the customer, answer any questions the customer may have. Ask your manager to approve or deny any discounts that the customer requests. Keep the conversation moving to a logical conclusion."
        },
        {
            "name": "Manager",
            "description": "Manager at a car dealership.",
            "prompt": "You are a manager at a car dealership. Your job is to approve or deny discounts, only approve reasonable discount requests. Keep the conversation moving to a logical conclusion."
        }
    ],
    "termination_condition": "Car sale concluded.",
    "output_variables": [
        {
            "name": "car_make",
            "type": "String"
        },
        {
            "name": "car_model",
            "type": "String"
        },
        {
            "name": "car_price_dollars",
            "type": "Number"
        },
        {
            "name": "car_mileage_kilometers",
            "type": "Number"
        }
    ]
}

mongo_client = MongoClient(os.environ["DB_CONNECTION_STRING"])
queue = SimulationQueue(mongo_client)
results = SimulationResults(mongo_client)

queue.insert(TEST_CONFIG, 1)

sim = SelectorGCSimulation(queue.retrieve_next())
asyncio.run(sim.run())