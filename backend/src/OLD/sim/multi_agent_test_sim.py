from prefect import flow, task
import time
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)

# Shared message queue (simulating agent communication)
message_queue = []

@task(retries=2, retry_delay_seconds=3)
def agent_1_produce():
    """ Simulate data production (now correctly formatted). """
    logging.info("Agent 1: Generating data...")
    data = {"id": 1, "file_path": "backend/src/util/database_api.py"}  # Valid dictionary
    message_queue.append(data)
    logging.info(f"Agent 1: Produced {data}")
    return data

@task
def agent_2_process():
    """ Process the data (file path handling). """
    if not message_queue:
        logging.warning("Agent 2: No data to process!")
        return None
    
    data = message_queue.pop(0)
    for item in data:
        if isinstance(item, dict):
            processed_data = {"id": item["id"], "processed_value": item["value"] * 2}
        logging.info(f"Agent 2: Processed {processed_data}")
    return processed_data

@task
def agent_3_consume(processed_data):
    """ Simulate storing the processed data. """
    if not processed_data:
        logging.warning("Agent 3: No processed data to consume!")
        return None
    logging.info(f"Agent 3: Consuming {processed_data}")
    time.sleep(1)  # Simulate saving to a database
    return "Data successfully stored!"

@flow
def multi_agent_workflow():
    raw_data = agent_1_produce()
    processed_data = agent_2_process()
    result = agent_3_consume(processed_data)
    logging.info(result)

if __name__ == "__main__":
    multi_agent_workflow()
