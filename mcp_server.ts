import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create an MCP server
const server = new McpServer({
  name: "Pokemon MCP Server",
  version: "1.0.0"
});

server.tool(
  "attack",
  "You can use this to execute a pokemon attack. Your moveName and pokemonName should be input as lowercase.",
  { moveName: z.string(), pokemonName: z.string() },
  async ({ moveName, pokemonName  }) => {
    const response = await fetch(`https://pokeapi.co/api/v2/move/${moveName}`);
    const move = await response.json();

    const accuracy = move.accuracy
    const power = move.power
    const hit = Math.random() < accuracy / 100
    const hitMessage = hit ? `Attack hit for ${power} HP!`:'Attack missed :('

    return {
      content: [{ type: "text", text: `${pokemonName} used ${moveName} | ${hitMessage}` }]
    };
  }
);

server.resource(
  "pokemon-abilities",
  new ResourceTemplate("pokemon://{name}/abilities", { list: undefined }),
  async (uri, { name }) => {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    const pokemon = await response.json()
    const abilities = pokemon.abilities

    return {
      contents: [{
        uri: uri.href,
        text: JSON.stringify(abilities)
      }]
    }
  }
);

// Add a dynamic greeting resource
server.resource(
  "pokemon",
  new ResourceTemplate("pokemon://{name}", { list: undefined }),
  async (uri, { name }) => {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    const pokemon = await response.text()

    return {
      contents: [{
        uri: uri.href,
        text: pokemon
      }]
    }
  }
);


// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
