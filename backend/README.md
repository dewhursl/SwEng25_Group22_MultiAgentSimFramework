# Multi-Agent Simulation Backend

## Running Backend Service

1. Install required python modules: \
`pip install -r backend/src/requirements.txt`
2. Populate required environment variables in `backend/src/.env`:
```
OPENAI_API_KEY="..."
DB_CONNECTION_STRING="mongodb://xxx:yyy"
```
3. Run service: \
`python backend/src/main.py`

## API Endpoints

### Simulation Configuration
**GET** `/sim/output?id=<simulation_id>`

Get results from all runs of a particular simulation.

**Optional GET Parameters:**
- `i=<index>` - Fetch only the specified element of the output array
- `show_messages=yes/no` - Include or exclude message logs (default is `yes`)

**Response Format:**
```json
{
  "id": "<simulation_id>",
  "num_runs": 999,
  "runs": [
    {
      "num_messages": 999,
      "messages": [
        {
          "agent": "placeholder",
          "message": "placeholder"
        }
      ],
      "output_variables": [
        {
          "name": "placeholder",
          "value": "placeholder"
        },
        {
          "name": "placeholder2",
          "value": 999
        }
      ]
    }
  ]        
} 
```

**POST/PUT** `/sim/create`

Create a new simulation. Simulations are queued and executed from oldest to newest.

**Request Format**
```json
{
    "num_runs": 999,
    "config": {
        "name": "placeholder",
        "agents": [
            {
                "name": "PlaceholderAgent",
                "description": "placeholder",
                "prompt": "placeholder"
            }
        ],
        "termination_condition": "placeholder",
        "output_variables": [
            {
                "name": "placeholder",
                "type": "String"
            },
            {
                "name": "placeholder2",
                "type": "Number"
            }
        ]
    }
}
```