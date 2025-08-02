# foc-engine-js

TypeScript SDK for interacting with FOC Engine to build onchain apps like magic.

## Installation

```bash
npm install foc-engine
```

## Quick Start

```js
const { Engine } = require('foc-engine');
const { buildGaslessTx, sendGaslessTx } = require('foc-engine/paymaster');

// Initialize engine for a specific network
const engine = new Engine('SN_MAINNET');

// Build a gasless transaction
const txData = await buildGaslessTx(engine.url, {
  network: 'SN_MAINNET',
  account: '0x1234...',
  calls: [{
    contractAddress: '0x...',
    entrypoint: 'transfer',
    calldata: ['0x...', '1000']
  }]
});

// Send the signed transaction
const txHash = await sendGaslessTx(engine.url, {
  account: '0x1234...',
  txData: txData,
  signature: ['0x...', '0x...'],
  network: 'SN_MAINNET'
});
```

## API Reference

### Engine

The main class for managing FOC Engine connections.

```typescript
import { Engine } from 'foc-engine';

const engine = new Engine(network: string);
```

**Parameters:**
- `network` - Network identifier: `'SN_MAINNET'`, `'SN_SEPOLIA'`, or `'SN_DEVNET'`

### Paymaster Functions

#### buildGaslessTx

Builds a gasless transaction request.

```typescript
const txData = await buildGaslessTx(engineUrl: string, input: BuildGaslessTxInput);
```

**Parameters:**
- `engineUrl` - The FOC Engine API URL
- `input` - Transaction input object:
  - `network` - Network identifier
  - `account` - Account address
  - `calls` - Array of Call objects
  - `deploymentData` (optional) - Deployment data for account deployment

**Returns:** `TypedData` object for signing

#### sendGaslessTx

Sends a signed gasless transaction.

```typescript
const txHash = await sendGaslessTx(engineUrl: string, input: SendGaslessTxInput);
```

**Parameters:**
- `engineUrl` - The FOC Engine API URL
- `input` - Transaction input object:
  - `account` - Account address
  - `txData` - TypedData from buildGaslessTx
  - `signature` - Array of signature values
  - `network` - Network identifier
  - `deploymentData` (optional) - Deployment data

**Returns:** Transaction hash as string

## Supported Networks

- **Mainnet**: `SN_MAINNET` - https://api.foc.fun
- **Sepolia Testnet**: `SN_SEPOLIA` - https://sepolia-api.foc.fun
- **Local Devnet**: `SN_DEVNET` - http://localhost:8080

## Development

### Build

```bash
npm run build
```

Compiles TypeScript source files to JavaScript in the `dist/` directory.

### Project Structure

```
foc-engine-js/
├── src/
│   ├── index.ts       # Main entry point
│   ├── engine.ts      # Engine class
│   ├── paymaster.ts   # Gasless transaction functions
│   ├── constants.ts   # API URLs and constants
│   └── utils.ts       # Utility functions
├── dist/              # Compiled output
└── tsconfig.json      # TypeScript configuration
```

## License

ISC
