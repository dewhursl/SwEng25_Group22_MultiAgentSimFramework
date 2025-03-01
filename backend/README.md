# Multi-Agent Simulation Backend

## Running simulation

- Required Python modules must be installed. (`pip install -r backend/src/requirements.txt`)
- Create file `backend/src/.env`
```
TOGETHER_API_KEY="..."
OPENAI_API_KEY="..."
```
- Inside `backend/src` run `python run_sim.py <num_runs>`

## Running API

- MongoDB must be running locally @ `mongodb://localhost:27017`
- Inside `backend/src` run `flask --app api.app run` (make sure Python modules are installed)

## API Endpoints

### Simulation Configuration
**Route:** `/report/output?id=<sim_id>`

**Optional GET Parameters:**
- `i=<index>` (Fetch only the specified element of the output array)
- `log=yes/no` (Include or exclude chat logs; default is `yes`)

**Response Format:**
```json
{
  "id": "<ID (sim_id)>",
  "num_runs" : "<Number>",
  "runs": [
    {
      "num_messages": "<Number>",
      "chat_log": [
        {
          "agent": "<String>",
          "message": "<String>"
        }
      ],
      "output_variables": [
        {
          "name": "<String>",
          "value": "<String | Number>"
        }
      ]
    }
  ]        
}   
```