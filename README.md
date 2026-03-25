<!-- BlackRoad SEO Enhanced -->

# dispatch engine

> Part of **[BlackRoad OS](https://blackroad.io)** — Sovereign Computing for Everyone

[![BlackRoad OS](https://img.shields.io/badge/BlackRoad-OS-ff1d6c?style=for-the-badge)](https://blackroad.io)
[![BlackRoad Agents](https://img.shields.io/badge/Org-BlackRoad-Agents-2979ff?style=for-the-badge)](https://github.com/BlackRoad-Agents)
[![License](https://img.shields.io/badge/License-Proprietary-f5a623?style=for-the-badge)](LICENSE)

**dispatch engine** is part of the **BlackRoad OS** ecosystem — a sovereign, distributed operating system built on edge computing, local AI, and mesh networking by **BlackRoad OS, Inc.**

## About BlackRoad OS

BlackRoad OS is a sovereign computing platform that runs AI locally on your own hardware. No cloud dependencies. No API keys. No surveillance. Built by [BlackRoad OS, Inc.](https://github.com/BlackRoad-OS-Inc), a Delaware C-Corp founded in 2025.

### Key Features
- **Local AI** — Run LLMs on Raspberry Pi, Hailo-8, and commodity hardware
- **Mesh Networking** — WireGuard VPN, NATS pub/sub, peer-to-peer communication
- **Edge Computing** — 52 TOPS of AI acceleration across a Pi fleet
- **Self-Hosted Everything** — Git, DNS, storage, CI/CD, chat — all sovereign
- **Zero Cloud Dependencies** — Your data stays on your hardware

### The BlackRoad Ecosystem
| Organization | Focus |
|---|---|
| [BlackRoad OS](https://github.com/BlackRoad-OS) | Core platform and applications |
| [BlackRoad OS, Inc.](https://github.com/BlackRoad-OS-Inc) | Corporate and enterprise |
| [BlackRoad AI](https://github.com/BlackRoad-AI) | Artificial intelligence and ML |
| [BlackRoad Hardware](https://github.com/BlackRoad-Hardware) | Edge hardware and IoT |
| [BlackRoad Security](https://github.com/BlackRoad-Security) | Cybersecurity and auditing |
| [BlackRoad Quantum](https://github.com/BlackRoad-Quantum) | Quantum computing research |
| [BlackRoad Agents](https://github.com/BlackRoad-Agents) | Autonomous AI agents |
| [BlackRoad Network](https://github.com/BlackRoad-Network) | Mesh and distributed networking |
| [BlackRoad Education](https://github.com/BlackRoad-Education) | Learning and tutoring platforms |
| [BlackRoad Labs](https://github.com/BlackRoad-Labs) | Research and experiments |
| [BlackRoad Cloud](https://github.com/BlackRoad-Cloud) | Self-hosted cloud infrastructure |
| [BlackRoad Forge](https://github.com/BlackRoad-Forge) | Developer tools and utilities |

### Links
- **Website**: [blackroad.io](https://blackroad.io)
- **Documentation**: [docs.blackroad.io](https://docs.blackroad.io)
- **Chat**: [chat.blackroad.io](https://chat.blackroad.io)
- **Search**: [search.blackroad.io](https://search.blackroad.io)

---


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
