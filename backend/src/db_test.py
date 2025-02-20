from pymongo import MongoClient
import database_api

db = database_api.DataBaseAPI("27017")

db.insert_config(
    {
        "id": "0",
        "num_runs": "3",
        "num_agents": "1",
        "agents": [
            {
                "name": "Craig",
                "description": "Just a lil guy",
                "parameters": [
                    {
                        "name": "Friends",
                        "value": "Infinite"
                    }
                ],
                "free_prompt": "You are Craig, this is test data"
            }
        ]
    }
)

result = db.query_config("0")
print(result)

db.insert_output(
    {
        "id": "1",
        "num_runs" : "1",
        "runs": [
            {
                "num_messages": "3",
                "chat_log": [
                    {
                        "agent": "Carman",
                        "message": "Hi I am carman I sell car"
                    },
                    {
                        "agent": "Buyman",
                        "message": "I like buy car, I have 1 money"
                    },
                    {
                        "agent": "Carman",
                        "message": "Yes I agree, take car thank you"
                    }
                ],
                "output_variables": [
                    {
                        "name": "Model",
                        "value": "Honda"
                    }
                ]
            }
        ]        
    }    
)

result2 = db.query_output("1")
print(result2)