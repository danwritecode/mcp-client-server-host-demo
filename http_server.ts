import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import OpenAI from 'openai';


const oaiClient = new OpenAI({
  apiKey: process.env["OPENROUTER_API_KEY"],
  baseURL: "https://openrouter.ai/api/v1",
});

const transport = new StdioClientTransport({
  command: "bun",
  args: ["mcp_server.ts"]
});

const mcpClient = new Client(
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

await mcpClient.connect(transport);

async function randomMcpAttack() {
  // get our available tools
  const tools = await mcpClient.listTools();
  const chatCompletion = await oaiClient.chat.completions.create({
    messages: [
      { 
        role: 'system', 
        content: "You are a pokemon trainer. You have various tools at your disposal to perform your duties." 
      },
      { 
        role: 'user', 
        content: 'Select a pokemon and a move and execute an attack' 
      }
    ],
    model: 'openai/gpt-4o-mini',
    tools: mapToolSchema(tools) // pass these tools into our model
  });

  const message = chatCompletion.choices[0].message

  if (!message.tool_calls || message.tool_calls.length === 0) {
    return null
  }

  return message.tool_calls[0].function
}

function mapToolSchema(inputSchema: any) {
  if (!inputSchema.tools || !Array.isArray(inputSchema.tools)) {
    throw new Error('Input must contain a tools array');
  }
  
  return inputSchema.tools.map((tool: any) => {
    // Get the input schema from the tool
    const schema = tool.inputSchema;
    
    return {
      "type": "function",
      "function": {
        "name": tool.name,
        "description": tool.description || `Execute the ${tool.name} function`,
        "parameters": {
          ...schema,
          "$schema": undefined // Remove the $schema property as it's not needed
        },
        "strict": true
      }
    };
  });
}

const server = Bun.serve({
  port: 3005,
  async fetch(request) {
    const url = new URL(request.url);
    console.log(url.pathname)

    if (url.pathname === "/tools") {
      const tools = await mcpClient.listTools();
      return new Response(JSON.stringify(tools));
    }

    if (url.pathname === "/attack") {
      const attackRes = await randomMcpAttack()

      const attackResult = await mcpClient.callTool({
        name: attackRes!.name,
        arguments: JSON.parse(attackRes!.arguments)
      });

      return new Response(JSON.stringify(attackResult));
    }

    return new Response("Welcome to Bun!");
  },
});

console.log(`Listening on ${server.url}`);
