import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { WebSocketClientTransport } from "@modelcontextprotocol/sdk/client/websocket.js";

const transport = new StdioClientTransport({
  command: "bun",
  args: ["mcp_server.ts"]
});

const client = new Client(
  {
    name: "pokemon-client",
    version: "1.0.0"
  },
  {
    capabilities: {
      prompts: {},
      resources: {},
      tools: {}
    }
  }
);

await client.connect(transport);

// List resources
const resources = await client.listResourceTemplates();
console.log(resources)

// List tools
const tools = await client.listTools();
console.log(JSON.stringify(tools, null, 2))

// Get a abilities
const pokemon_abilities = await client.readResource({ uri: "pokemon://pikachu/abilities"})
console.log(pokemon_abilities)

// Execute tool
const attack_result = await client.callTool({
  name: "attack",
  arguments: {
    moveName: "hurricane",
    pokemonName: "Moltres"
  }
});

console.log(attack_result)



// Call a tool
const lowAccuracyMoves = [
  { move: "hurricane", accuracy: 70 },
  { move: "zap-cannon", accuracy: 50 },
  { move: "hydro-pump", accuracy: 80 },
  { move: "thunder", accuracy: 70 },
  { move: "focus-blast", accuracy: 70 },
  { move: "stone-edge", accuracy: 80 },
  { move: "inferno", accuracy: 50 },
  { move: "dynamic-punch", accuracy: 50 },
  { move: "blizzard", accuracy: 70 },
  { move: "guillotine", accuracy: 30 }
];

const pokemon = [
  "moltres", "zapdos", "blastoise", "raichu", "machamp", 
  "tyranitar", "charizard", "heracross", "articuno", "scizor"
];

// Run the attacks in a loop
for (let i = 0; i < 10; i++) {
  const result = await client.callTool({
    name: "attack",
    arguments: {
      moveName: lowAccuracyMoves[i].move,
      pokemonName: pokemon[i]
    }
  });
  
  console.log(`Attack ${i+1} result:`, result);
}
