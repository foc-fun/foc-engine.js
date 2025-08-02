# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
# Build the TypeScript project
npm run build

# Run tests (currently not implemented)
npm test  # Note: Tests are not yet configured - will exit with error

# Install dependencies
npm install
```

## Architecture Overview

This is a TypeScript SDK for interacting with the FOC Engine API, which provides paymaster services for gasless transactions on Starknet.

### Key Components

1. **Engine Module** (`src/engine.ts`): Core class that manages the FOC Engine URL based on the network (mainnet, sepolia, or devnet).

2. **Paymaster Module** (`src/paymaster.ts`): Handles gasless transaction operations:
   - `buildGaslessTx`: Builds a gasless transaction by calling the FOC Engine API
   - `sendGaslessTx`: Sends a signed gasless transaction to be executed

3. **Network Configuration** (`src/constants.ts` & `src/utils.ts`):
   - Supports three networks: `SN_MAINNET`, `SN_SEPOLIA`, `SN_DEVNET`
   - API endpoints are configured in constants.ts
   - `getFocEngineUrl` utility function maps network names to API URLs

### Module System

The project uses a mixed module system:
- TypeScript is configured to output ESNext modules
- Source files use both ES6 imports and CommonJS exports
- Main entry point (`src/index.ts`) uses CommonJS module.exports

### Dependencies

- **starknet**: Core dependency for Starknet blockchain interactions
- **typescript** & **@types/node**: Development dependencies for TypeScript support

### TypeScript Configuration

- Strict mode enabled
- Outputs to `dist/` directory with declaration files
- Target: ESNext with Node module resolution