import os
from time import sleep
from pymongo import MongoClient

from dotenv import load_dotenv
load_dotenv()

from db.simulation_queue import SimulationQueue

mongo_client = MongoClient(os.environ["DB_CONNECTION_STRING"])
queue = SimulationQueue(mongo_client)

test_config = {
    "name": "Car Sale Simulation",
    "agents": [
        {
            "name": "Customer",
            "description": "Customer at a car dealership.",
            "prompt": "You are a customer at a car dealership. Try to buy a car within your budget of $25000, ask about discounts and make sure the car has a reasonable mileage. Do not reveal your budget! Try to settle at the lowest possible price. You need to know the make and model of the car."
        },
        {
            "name": "CarSalesman",
            "description": "Salesman at a car dealership.",
            "prompt": "You are a salesman at a car dealership. Sell a car to the customer, do not reveal how much profit you are making to the customer. Only your manager can approve or deny discounts."
        },
        {
            "name": "Manager",
            "description": "Manager at a car dealership.",
            "prompt": "You are a manager at a car dealership. Your job is to approve or deny discounts, only approve reasonable discount requests."
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

# print(queue.insert(test_config, 10))

retrieved_config = queue.retrieve_next()
for agent in retrieved_config["agents"]:
    print(agent["prompt"])