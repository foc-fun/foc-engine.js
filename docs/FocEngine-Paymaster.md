# FOC Engine & Paymaster Core

The FOC Engine & Paymaster system provides gasless transaction capabilities for Starknet applications. It enables users to interact with smart contracts without paying gas fees, making dApps more accessible and user-friendly.

## Features

- **Gasless Transactions**: Execute Starknet transactions without requiring users to hold ETH for gas
- **Multi-Network Support**: Works across mainnet, sepolia, and devnet environments
- **Account Deployment**: Support for deploying new accounts as part of gasless transactions
- **Flexible Configuration**: Custom engine URLs and network-specific endpoints
- **Type-Safe API**: Full TypeScript support with proper type definitions
- **Error Handling**: Comprehensive error handling with meaningful error messages

## Quick Start

### Basic Usage
```typescript
import { FocEngine, Paymaster } from 'foc-engine-js';

// Initialize engine and paymaster
const engine = new FocEngine('SN_SEPOLIA');
const paymaster = new Paymaster(engine);

async function executeGaslessTransaction() {
  // Define your contract calls
  const calls = [{
    contractAddress: '0x123...',
    entrypoint: 'transfer',
    calldata: ['0xrecipient...', '1000', '0']
  }];

  // Build gasless transaction
  const txData = await paymaster.buildGaslessTx(calls, {
    account: '0xmyaccount...',
    network: 'sepolia'
  });

  // Sign the transaction (using your wallet/signer)
  const signature = await signTypedData(txData);

  // Send gasless transaction
  const txHash = await paymaster.sendGaslessTx({
    txData,
    signature,
    account: '0xmyaccount...',
    network: 'sepolia'
  });

  console.log('Transaction hash:', txHash);
}
```

### Custom Engine URL
```typescript
// Use a custom FOC Engine endpoint
const customEngine = new FocEngine('SN_SEPOLIA', 'https://custom-api.example.com');
const paymaster = new Paymaster(customEngine);
```

## Core Components

### FocEngine Class

The `FocEngine` class manages the connection to FOC Engine API endpoints based on the network configuration.

```typescript
class FocEngine {
  public url: string;

  constructor(network: string, customUrl?: string);
}
```

#### Constructor Parameters
- `network`: Target network (`'SN_MAINNET'`, `'SN_SEPOLIA'`, `'SN_DEVNET'`)
- `customUrl` (optional): Override the default API URL for the network

#### Example Usage
```typescript
// Using default network URLs
const mainnetEngine = new FocEngine('SN_MAINNET');
const sepoliaEngine = new FocEngine('SN_SEPOLIA');
const devnetEngine = new FocEngine('SN_DEVNET');

// Using custom URL
const customEngine = new FocEngine('SN_SEPOLIA', 'https://my-custom-api.com');
```

### Paymaster Class

The `Paymaster` class handles the gasless transaction workflow, including building transaction data and submitting signed transactions.

```typescript
class Paymaster {
  constructor(engine: FocEngine);
  
  async buildGaslessTx(calls: Call[], options?: BuildOptions): Promise<TypedData>;
  async sendGaslessTx(signedTxData: SendOptions): Promise<string>;
}
```

## API Reference

### Network Configuration

The system supports three Starknet networks with pre-configured API endpoints:

```typescript
// Network identifiers
type Network = 'SN_MAINNET' | 'SN_SEPOLIA' | 'SN_DEVNET';

// Default API endpoints
const endpoints = {
  'SN_MAINNET': 'https://api.foc.fun',
  'SN_SEPOLIA': 'https://sepolia-api.foc.fun', 
  'SN_DEVNET': 'http://localhost:8080'
};
```

### Building Gasless Transactions

#### `buildGaslessTx(calls, options?)`

Prepares a transaction for gasless execution by building the appropriate typed data structure.

```typescript
interface BuildOptions {
  deploymentData?: DeploymentData;
  account?: string;
  network?: string;
  chainId?: string;
  nonce?: string;
  version?: string;
  maxFee?: string;
  resourceBounds?: any;
}

const txData = await paymaster.buildGaslessTx(calls, {
  account: '0xmyaccount...',
  network: 'sepolia',
  deploymentData: {
    class_hash: '0xclass...',
    calldata: ['0x1', '0x2'],
    salt: '0xsalt...',
    unique: '0xunique...'
  }
});
```

**Parameters:**
- `calls`: Array of Starknet `Call` objects containing contract interactions
- `options`: Configuration options for the transaction

**Returns:** `Promise<TypedData>` - EIP-712 typed data structure for signing

### Sending Gasless Transactions

#### `sendGaslessTx(signedTxData)`

Submits a signed gasless transaction to the FOC Engine for execution.

```typescript
interface SendOptions {
  txData: TypedData;
  signature: string[];
  account?: string;
  network?: string;
  deploymentData?: DeploymentData;
}

const txHash = await paymaster.sendGaslessTx({
  txData,
  signature: ['0xr', '0xs'],
  account: '0xmyaccount...',
  network: 'sepolia'
});
```

**Parameters:**
- `txData`: The typed data returned from `buildGaslessTx`
- `signature`: Array of signature components from signing the typed data
- `account`: Account address executing the transaction
- `network`: Target network for transaction execution
- `deploymentData`: Optional account deployment information

**Returns:** `Promise<string>` - Transaction hash of the executed transaction

### Account Deployment

For deploying new accounts alongside gasless transactions:

```typescript
interface DeploymentData {
  class_hash: string;    // Account contract class hash
  calldata: string[];    // Constructor calldata
  salt: string;          // Deployment salt
  unique: string;        // Unique identifier
}

const deploymentData = {
  class_hash: '0x123...',
  calldata: ['0xpubkey...'],
  salt: '0xsalt...',
  unique: '0xunique...'
};

const txData = await paymaster.buildGaslessTx(calls, {
  account: '0xnewaccount...',
  network: 'sepolia',
  deploymentData
});
```

## Advanced Usage Patterns

### Multi-Call Transactions
```typescript
async function executeMultipleOperations() {
  const calls = [
    {
      contractAddress: '0xerc20...',
      entrypoint: 'approve',
      calldata: ['0xspender...', '1000', '0']
    },
    {
      contractAddress: '0xdex...',
      entrypoint: 'swap',
      calldata: ['0xtoken1...', '0xtoken2...', '1000']
    },
    {
      contractAddress: '0xnft...',
      entrypoint: 'mint',
      calldata: ['0xrecipient...', '1']
    }
  ];

  const txData = await paymaster.buildGaslessTx(calls, {
    account: userAccount,
    network: 'sepolia'
  });

  // Sign and send transaction
  const signature = await signTypedData(txData);
  const txHash = await paymaster.sendGaslessTx({
    txData,
    signature,
    account: userAccount,
    network: 'sepolia'
  });

  return txHash;
}
```

### Environment-Based Configuration
```typescript
class PaymasterService {
  private paymaster: Paymaster;

  constructor() {
    const network = this.getNetworkFromEnv();
    const customUrl = process.env.FOC_ENGINE_URL;
    
    const engine = new FocEngine(network, customUrl);
    this.paymaster = new Paymaster(engine);
  }

  private getNetworkFromEnv(): string {
    const env = process.env.NODE_ENV || 'development';
    
    switch (env) {
      case 'production': return 'SN_MAINNET';
      case 'staging': return 'SN_SEPOLIA';
      default: return 'SN_DEVNET';
    }
  }

  async executeGaslessTransaction(calls: Call[], userAccount: string) {
    try {
      const txData = await this.paymaster.buildGaslessTx(calls, {
        account: userAccount,
        network: this.getNetworkFromEnv()
      });

      return { txData, success: true };
    } catch (error) {
      console.error('Failed to build gasless transaction:', error);
      return { error: error.message, success: false };
    }
  }
}
```

### Wallet Integration Example
```typescript
import { connect, disconnect } from 'starknetkit';

class GaslessWallet {
  private paymaster: Paymaster;
  private connection: any;

  constructor(network: string = 'SN_SEPOLIA') {
    const engine = new FocEngine(network);
    this.paymaster = new Paymaster(engine);
  }

  async connect() {
    const { wallet } = await connect();
    this.connection = wallet;
    return wallet;
  }

  async executeGasless(calls: Call[]) {
    if (!this.connection) {
      throw new Error('Wallet not connected');
    }

    const account = this.connection.account;
    
    // Build gasless transaction
    const txData = await this.paymaster.buildGaslessTx(calls, {
      account: account.address,
      network: 'sepolia'
    });

    // Sign with connected wallet
    const signature = await account.signMessage(txData);

    // Submit gasless transaction
    const txHash = await this.paymaster.sendGaslessTx({
      txData,
      signature: [signature.r, signature.s],
      account: account.address,
      network: 'sepolia'
    });

    return txHash;
  }
}
```

### Error Handling and Retries
```typescript
class RobustPaymaster {
  private paymaster: Paymaster;
  private maxRetries: number = 3;

  constructor(network: string) {
    const engine = new FocEngine(network);
    this.paymaster = new Paymaster(engine);
  }

  async buildGaslessTxWithRetry(calls: Call[], options: any, retries = 0): Promise<TypedData> {
    try {
      return await this.paymaster.buildGaslessTx(calls, options);
    } catch (error) {
      if (retries < this.maxRetries) {
        console.warn(`Build attempt ${retries + 1} failed, retrying...`);
        await this.delay(1000 * (retries + 1)); // Exponential backoff
        return this.buildGaslessTxWithRetry(calls, options, retries + 1);
      }
      throw error;
    }
  }

  async sendGaslessTxWithRetry(signedTxData: any, retries = 0): Promise<string> {
    try {
      return await this.paymaster.sendGaslessTx(signedTxData);
    } catch (error) {
      if (retries < this.maxRetries && this.isRetryableError(error)) {
        console.warn(`Send attempt ${retries + 1} failed, retrying...`);
        await this.delay(1000 * (retries + 1));
        return this.sendGaslessTxWithRetry(signedTxData, retries + 1);
      }
      throw error;
    }
  }

  private isRetryableError(error: any): boolean {
    // Retry on network errors, but not on invalid signatures, etc.
    const retryableMessages = [
      'network error',
      'timeout',
      'connection reset',
      'temporary failure'
    ];
    
    const errorMessage = error.message?.toLowerCase() || '';
    return retryableMessages.some(msg => errorMessage.includes(msg));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Transaction Status Tracking
```typescript
class PaymasterWithTracking {
  private paymaster: Paymaster;

  constructor(network: string) {
    const engine = new FocEngine(network);
    this.paymaster = new Paymaster(engine);
  }

  async executeWithTracking(calls: Call[], options: any) {
    const trackingId = this.generateTrackingId();
    
    try {
      console.log(`[${trackingId}] Building gasless transaction...`);
      const txData = await this.paymaster.buildGaslessTx(calls, options);
      
      console.log(`[${trackingId}] Transaction data built, requesting signature...`);
      const signature = await this.getSignature(txData);
      
      console.log(`[${trackingId}] Signature obtained, sending transaction...`);
      const txHash = await this.paymaster.sendGaslessTx({
        txData,
        signature,
        account: options.account,
        network: options.network
      });
      
      console.log(`[${trackingId}] Transaction sent successfully: ${txHash}`);
      
      // Monitor transaction status
      await this.monitorTransaction(txHash, trackingId);
      
      return { txHash, trackingId };
    } catch (error) {
      console.error(`[${trackingId}] Transaction failed:`, error);
      throw error;
    }
  }

  private generateTrackingId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private async getSignature(txData: TypedData): Promise<string[]> {
    // Implementation depends on your signing method
    throw new Error('Signature method not implemented');
  }

  private async monitorTransaction(txHash: string, trackingId: string): Promise<void> {
    // Implementation for monitoring transaction status
    console.log(`[${trackingId}] Monitoring transaction ${txHash}...`);
  }
}
```

## Integration with React Applications

### Custom Hook for Gasless Transactions
```typescript
import { useState, useCallback } from 'react';

interface UseGaslessTransactionResult {
  executeGasless: (calls: Call[]) => Promise<string>;
  isLoading: boolean;
  error: string | null;
  txHash: string | null;
  resetState: () => void;
}

export function useGaslessTransaction(
  network: string = 'SN_SEPOLIA',
  userAccount?: string
): UseGaslessTransactionResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const paymaster = useMemo(() => {
    const engine = new FocEngine(network);
    return new Paymaster(engine);
  }, [network]);

  const executeGasless = useCallback(async (calls: Call[]): Promise<string> => {
    if (!userAccount) {
      throw new Error('User account not provided');
    }

    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      // Build transaction
      const txData = await paymaster.buildGaslessTx(calls, {
        account: userAccount,
        network: network.toLowerCase().replace('sn_', '')
      });

      // Request signature from user
      const signature = await requestSignature(txData);

      // Send transaction
      const hash = await paymaster.sendGaslessTx({
        txData,
        signature,
        account: userAccount,
        network: network.toLowerCase().replace('sn_', '')
      });

      setTxHash(hash);
      return hash;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to execute gasless transaction';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [paymaster, userAccount, network]);

  const resetState = useCallback(() => {
    setError(null);
    setTxHash(null);
    setIsLoading(false);
  }, []);

  return {
    executeGasless,
    isLoading,
    error,
    txHash,
    resetState
  };
}
```

### React Component Example
```typescript
function GaslessTransactionButton({ calls, userAccount }: {
  calls: Call[];
  userAccount: string;
}) {
  const { executeGasless, isLoading, error, txHash } = useGaslessTransaction(
    'SN_SEPOLIA',
    userAccount
  );

  const handleExecute = async () => {
    try {
      await executeGasless(calls);
    } catch (err) {
      console.error('Transaction failed:', err);
    }
  };

  return (
    <div>
      <button 
        onClick={handleExecute} 
        disabled={isLoading}
        className="gasless-tx-button"
      >
        {isLoading ? 'Processing...' : 'Execute Gasless Transaction'}
      </button>
      
      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}
      
      {txHash && (
        <div className="success-message">
          Transaction sent! Hash: {txHash}
        </div>
      )}
    </div>
  );
}
```

## Error Handling

### Common Error Types
```typescript
// Network configuration errors
try {
  const engine = new FocEngine('INVALID_NETWORK');
} catch (error) {
  // Error: Unsupported network: INVALID_NETWORK (supported: SN_MAINNET, SN_SEPOLIA, SN_DEVNET)
}

// Transaction building errors
try {
  const txData = await paymaster.buildGaslessTx([], { account: '' });
} catch (error) {
  // Error: Failed to build gasless transaction
}

// Transaction sending errors
try {
  const txHash = await paymaster.sendGaslessTx({ /* invalid data */ });
} catch (error) {
  // Error: Failed to send gasless transaction
}
```

### Error Recovery Strategies
```typescript
async function robustGaslessExecution(calls: Call[], options: any) {
  const maxRetries = 3;
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const txData = await paymaster.buildGaslessTx(calls, options);
      const signature = await getSignature(txData);
      const txHash = await paymaster.sendGaslessTx({
        txData,
        signature,
        ...options
      });
      
      return { success: true, txHash };
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => 
          setTimeout(resolve, 1000 * Math.pow(2, attempt - 1))
        );
      }
    }
  }

  return { success: false, error: lastError.message };
}
```

## Best Practices

### 1. Network Configuration
```typescript
// Use environment-specific configuration
const getNetwork = () => {
  if (process.env.NODE_ENV === 'production') return 'SN_MAINNET';
  if (process.env.NODE_ENV === 'staging') return 'SN_SEPOLIA';
  return 'SN_DEVNET';
};

const engine = new FocEngine(getNetwork());
```

### 2. Error Handling
```typescript
// Always wrap gasless operations in try-catch
try {
  const txHash = await paymaster.buildGaslessTx(calls, options);
  // Handle success
} catch (error) {
  // Handle specific error types
  if (error.message.includes('network')) {
    // Handle network errors
  } else if (error.message.includes('signature')) {
    // Handle signature errors
  } else {
    // Handle general errors
  }
}
```

### 3. Transaction Validation
```typescript
// Validate calls before building gasless transaction
function validateCalls(calls: Call[]): boolean {
  return calls.every(call => 
    call.contractAddress &&
    call.entrypoint &&
    Array.isArray(call.calldata)
  );
}

if (!validateCalls(calls)) {
  throw new Error('Invalid call data provided');
}
```

### 4. Resource Management
```typescript
// Create paymaster instances judiciously
class PaymasterManager {
  private static instances = new Map<string, Paymaster>();

  static getPaymaster(network: string): Paymaster {
    if (!this.instances.has(network)) {
      const engine = new FocEngine(network);
      this.instances.set(network, new Paymaster(engine));
    }
    return this.instances.get(network)!;
  }
}
```

### 5. Testing
```typescript
// Mock paymaster for testing
class MockPaymaster extends Paymaster {
  async buildGaslessTx(calls: Call[], options?: any): Promise<TypedData> {
    return {
      types: {},
      primaryType: 'Test',
      domain: {},
      message: {}
    };
  }

  async sendGaslessTx(signedTxData: any): Promise<string> {
    return '0xtest_transaction_hash';
  }
}

// Use in tests
const mockPaymaster = new MockPaymaster(new FocEngine('SN_DEVNET'));
```

The FOC Engine & Paymaster system provides a powerful foundation for building gasless applications on Starknet, enabling seamless user experiences without the friction of gas fees.