/**
 * BlackRoad Dispatch Engine
 * Parses incoming messages, extracts intent and entities, routes to agents.
 *
 * Usage:
 *   const { dispatch } = require('./dispatch');
 *   const result = dispatch("Deploy the chat worker to production");
 *   // { agent: "octavia", intent: "deploy", confidence: 0.85, entities: [...] }
 */

const AGENT_INTENTS = {
  coder: {
    keywords: [
      'code', 'script', 'function', 'class', 'module', 'build', 'implement',
      'program', 'compile', 'debug', 'fix', 'refactor', 'test', 'lint',
      'python', 'javascript', 'rust', 'bash', 'html', 'css', 'sql',
      'typescript', 'node', 'react', 'api', 'endpoint', 'library'
    ],
    weight: 1.0
  },
  scholar: {
    keywords: [
      'research', 'explain', 'analyze', 'compare', 'define', 'study',
      'investigate', 'theory', 'concept', 'evidence', 'source', 'reference',
      'paper', 'literature', 'methodology', 'framework', 'history'
    ],
    weight: 1.0
  },
  pascal: {
    keywords: [
      'math', 'calculate', 'equation', 'formula', 'proof', 'theorem',
      'prime', 'integral', 'derivative', 'algebra', 'geometry', 'calculus',
      'statistics', 'probability', 'amundson', 'constant', 'sequence'
    ],
    weight: 1.2
  },
  writer: {
    keywords: [
      'write', 'draft', 'compose', 'blog', 'article', 'post', 'copy',
      'content', 'documentation', 'readme', 'guide', 'email', 'letter',
      'report', 'summary', 'changelog', 'announcement', 'tagline'
    ],
    weight: 1.0
  },
  cipher: {
    keywords: [
      'security', 'vulnerability', 'encrypt', 'decrypt', 'hash', 'token',
      'secret', 'credential', 'password', 'firewall', 'ssl', 'tls',
      'certificate', 'audit', 'permission', 'authentication', 'scan'
    ],
    weight: 1.1
  },
  tutor: {
    keywords: [
      'teach', 'learn', 'understand', 'lesson', 'course', 'beginner',
      'introduction', 'getting started', 'onboard', 'walkthrough',
      'step by step', 'basics', 'fundamentals', 'how to start'
    ],
    weight: 1.0
  },
  alice: {
    keywords: [
      'network', 'dns', 'nginx', 'proxy', 'gateway', 'port', 'ip',
      'subnet', 'ping', 'latency', 'bandwidth', 'uptime', 'pi-hole',
      'redis', 'cache', 'qdrant', 'postgres', 'database'
    ],
    weight: 1.0
  },
  cecilia: {
    keywords: [
      'model', 'ollama', 'inference', 'embedding', 'vector', 'minio',
      'storage', 'bucket', 'hailo', 'npu', 'tensor', 'neural',
      'training', 'quantize', 'llama', 'mistral', 'weights'
    ],
    weight: 1.0
  },
  octavia: {
    keywords: [
      'deploy', 'docker', 'container', 'gitea', 'pipeline', 'worker',
      'nats', 'build', 'release', 'rollback', 'staging', 'production',
      'service', 'daemon', 'systemd', 'ci', 'cd'
    ],
    weight: 1.0
  },
  aria: {
    keywords: [
      'monitor', 'alert', 'metric', 'dashboard', 'status', 'health',
      'log', 'trace', 'influxdb', 'grafana', 'headscale', 'vpn',
      'tunnel', 'watchdog', 'heartbeat', 'downtime'
    ],
    weight: 1.0
  },
  lucidia: {
    keywords: [
      'website', 'site', 'hosting', 'web app', 'powerdns', 'static',
      'subdomain', 'web server', 'html page', 'actions runner'
    ],
    weight: 0.9
  },
  road: {
    keywords: [
      'fleet', 'all agents', 'coordinate', 'priority', 'roadmap',
      'plan', 'strategy', 'assign', 'delegate', 'overview', 'briefing'
    ],
    weight: 0.8
  }
};

const ENTITY_PATTERNS = [
  { type: 'ip_address', pattern: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g },
  { type: 'port', pattern: /\bport\s*:?\s*(\d{2,5})\b/gi },
  { type: 'domain', pattern: /\b[\w-]+\.(?:blackroad\.io|blackroad\.workers\.dev)\b/g },
  { type: 'file_path', pattern: /(?:\/[\w.-]+){2,}/g },
  { type: 'agent_name', pattern: /\b(road|coder|scholar|alice|cecilia|octavia|lucidia|aria|pascal|writer|tutor|cipher)\b/gi },
  { type: 'model_name', pattern: /\b(llama3\.2|codellama|mistral|gemma|phi|qwen)\b/gi },
  { type: 'url', pattern: /https?:\/\/\S+/gi },
  { type: 'number', pattern: /\b\d+\b/g }
];


function extractEntities(message) {
  const entities = [];
  const seen = new Set();

  for (const { type, pattern } of ENTITY_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;
    while ((match = regex.exec(message)) !== null) {
      const value = match[1] || match[0];
      const key = `${type}:${value.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        entities.push({
          type,
          value,
          position: match.index
        });
      }
    }
  }

  return entities;
}


function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s.-]/g, ' ').split(/\s+/).filter(Boolean);
}


function scoreAgent(message, agentId, config) {
  const msgLower = message.toLowerCase();
  const tokens = tokenize(message);
  let hits = 0;
  let totalKeywords = config.keywords.length;

  for (const keyword of config.keywords) {
    if (keyword.includes(' ')) {
      // Multi-word keyword: check as substring
      if (msgLower.includes(keyword)) {
        hits += 2;
      }
    } else {
      if (tokens.includes(keyword)) {
        hits += 1;
      }
    }
  }

  if (totalKeywords === 0) return 0;

  const rawScore = (hits / Math.min(totalKeywords, 5)) * config.weight;
  return Math.min(Math.round(rawScore * 100) / 100, 1.0);
}


function detectIntent(message) {
  const msgLower = message.toLowerCase();

  // Question detection
  if (/^(what|how|why|when|where|who|is|are|can|could|should|would|do|does|did)\b/.test(msgLower)) {
    return 'question';
  }
  // Command detection
  if (/^(run|start|stop|deploy|build|create|delete|update|check|scan|fix|restart)\b/.test(msgLower)) {
    return 'command';
  }
  // Request detection
  if (/^(please|can you|could you|i need|i want|help me)\b/.test(msgLower)) {
    return 'request';
  }
  return 'statement';
}


/**
 * Dispatch a message to the best-matching agent.
 *
 * @param {string} message - The user message to route
 * @returns {{ agent: string, intent: string, confidence: number, entities: Array, message_type: string }}
 */
function dispatch(message) {
  if (!message || typeof message !== 'string' || !message.trim()) {
    return {
      agent: 'road',
      intent: 'unknown',
      confidence: 0,
      entities: [],
      message_type: 'empty'
    };
  }

  const entities = extractEntities(message);
  const messageType = detectIntent(message);
  const scores = {};

  for (const [agentId, config] of Object.entries(AGENT_INTENTS)) {
    const score = scoreAgent(message, agentId, config);
    if (score > 0) {
      scores[agentId] = score;
    }
  }

  // Sort by score
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  if (ranked.length === 0) {
    return {
      agent: 'road',
      intent: 'unmatched',
      confidence: 0.1,
      entities,
      message_type: messageType
    };
  }

  const [bestAgent, bestScore] = ranked[0];

  return {
    agent: bestAgent,
    intent: bestAgent,
    confidence: bestScore,
    entities,
    message_type: messageType,
    alternatives: ranked.slice(1, 4).map(([agent, score]) => ({ agent, confidence: score }))
  };
}


// CLI mode
if (require.main === module) {
  const message = process.argv.slice(2).join(' ');
  if (!message) {
    console.error('Usage: node dispatch.js "your message here"');
    process.exit(1);
  }
  const result = dispatch(message);
  console.log(JSON.stringify(result, null, 2));
}


module.exports = { dispatch, extractEntities, detectIntent };
