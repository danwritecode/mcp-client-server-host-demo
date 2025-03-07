# Pokemon MCP Demo

A demo project showcasing the Model Context Protocol (MCP) integration with Pokemon data. This project includes:

- An MCP server that provides Pokemon data and attack capabilities
- An MCP client that interacts with the server
- An HTTP server that allows LLMs to use Pokemon tools via OpenRouter

## Installation

```bash
bun install
```

## Running the Project

### MCP Server and Client Demo
Run the client which automatically launches the MCP server:

```bash
bun mcp_client.ts
```

### HTTP Server with LLM Integration
Set your OpenRouter API key and run the HTTP server:

```bash
export OPENROUTER_API_KEY=your_api_key_here
bun http_server.ts
```

Then access the server at http://localhost:3005:
- `/tools` - List available tools
- `/attack` - Execute a random Pokemon attack using LLM

This project uses [Bun](https://bun.sh) as its JavaScript runtime.