# dispatch-engine

Message dispatcher for BlackRoad OS. Parses messages, extracts intent and entities, and routes to the correct agent.

## What This Is

A Node.js module that takes an incoming message string and returns the best-matching agent along with extracted entities (IPs, domains, file paths, agent names, model names, URLs). Used as the front door for all agent interactions.

## Requirements

- Node.js 14+

## Usage

```javascript
const { dispatch } = require('./dispatch');

const result = dispatch("Deploy the chat worker to production on port 9005");
console.log(result);
// {
//   agent: "octavia",
//   intent: "octavia",
//   confidence: 0.8,
//   entities: [{ type: "port", value: "9005", position: 47 }],
//   message_type: "command",
//   alternatives: [{ agent: "coder", confidence: 0.2 }]
// }
```

```bash
# CLI mode
node dispatch.js "Scan the network for open ports on 192.168.4.49"
```

## Exports

| Function | Description |
|----------|-------------|
| `dispatch(message)` | Route message to agent. Returns `{ agent, intent, confidence, entities, message_type }` |
| `extractEntities(message)` | Extract structured entities from text |
| `detectIntent(message)` | Classify message as question, command, request, or statement |

## Entity Types

- `ip_address` -- IPv4 addresses
- `port` -- Port numbers
- `domain` -- BlackRoad domains
- `file_path` -- Unix file paths
- `agent_name` -- Known agent IDs
- `model_name` -- Ollama model names
- `url` -- HTTP/HTTPS URLs
- `number` -- Numeric values

Part of BlackRoad-Agents. Remember the Road. Pave Tomorrow. Incorporated 2025.
