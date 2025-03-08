import uuid
import time

from db.base import MongoBase

class SimulationQueue(MongoBase):
    def __init__(self, mongo_client):
        super().__init__(mongo_client)
        self.queue_collection = self.db["queue"]

    def insert(self, config, num_runs):
        simulation_id = str(uuid.uuid4())[:8]
        
        return self.insert_with_id(simulation_id, config, num_runs)
    
    def insert_with_id(self, simulation_id, config, num_runs):
        # validate simulation config
        if "name" in config and config["name"] and \
            "agents" in config and len(config["agents"]) >= 2 and \
            "termination_condition" in config and config["termination_condition"] and \
            "output_variables" in config and len(config["output_variables"]) >= 1:
            for agent in config["agents"]:
                if "name" in agent and agent["name"] and \
                    "description" in agent and agent["description"] and \
                    "prompt" in agent and agent["prompt"]:
                    continue
                else:
                    return None

            for variable in config["output_variables"]:
                if "name" in variable and variable["name"] and \
                    "type" in variable and (variable["type"] == "String" or variable["type"] == "Number"):
                    continue
                else:
                    return None
        else:
            return None
        
        # validate number of runs
        if num_runs < 1:
            return None

        # insert into database
        self.queue_collection.insert_one({
            "simulation_id": simulation_id,
            "timestamp": int(time.time()),
            "remaining_runs": num_runs,
            "config": config
        })

        return simulation_id
    
    def retrieve_next(self):
        # get oldest object
        oldest_object = self.queue_collection.find_one(sort=[("timestamp", 1)])

        if not oldest_object:
            return {}

        # update remaining runs
        remaining_runs = oldest_object["remaining_runs"] - 1
        query = {"simulation_id": oldest_object["simulation_id"]}
        self.queue_collection.update_one(query, {"$inc": {"remaining_runs": -1}})

        # remove object if all simulation runs are done
        if remaining_runs <= 0:
            self.queue_collection.delete_one(query)

        simulation_id = oldest_object["simulation_id"]
        config = oldest_object["config"]

        return simulation_id, config