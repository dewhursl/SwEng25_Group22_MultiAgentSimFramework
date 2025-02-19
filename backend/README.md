# Multi-Agent Simulation Backend

## Running manually

- Required AutoGen Python modules must be installed.
- Create file `backend/src/.env`
```
TOGETHER_API_KEY="..."
OPENAI_API_KEY="..."
```
- Run `backend/src/main.py`

## API Endpoints

### Simulation Configuration
**Route:** `/report/config?id=<sim_id>`

**Response Format:**
```json
{
  "id": "<ID (sim_id)>",
  "num_runs": "<Number>",
  "num_agents": "<Number>",
  "agents": [
    {
      "name": "<String>",
      "description": "<String>",
      "parameters": [
        {
          "name": "<String>",
          "value": "<String>"
        }
      ],
      "free_prompt": "<String>"
    }
  ]
}
```

### Simulation Output
**Route:** `/report/output?id=<sim_id>`

**Optional GET Parameters:**
- `i=<index>` (Fetch only the specified element of the output array)
- `log=yes/no` (Include or exclude chat logs; default is `yes`)

**Response Format:**
```json
[
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
```