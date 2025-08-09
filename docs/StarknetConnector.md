# Enhanced StarknetConnector

The StarknetConnector now supports configurable balance token addresses, multi-token support, and network-aware defaults for seamless integration across different Starknet networks.

## Key Features

- **Configurable Balance Token**: Set custom token for primary balance display
- **Multi-Token Support**: Track balances for multiple tokens simultaneously  
- **Network-Aware Defaults**: Automatic token configuration based on network
- **Runtime Configuration**: Change tokens and networks dynamically
- **Batch Balance Fetching**: Get all supported token balances at once

## Quick Start

### Basic Usage (Default ETH Balance)
```tsx
import { StarknetProvider, useStarknet } from 'foc-engine-js';

function App() {
  return (
    <StarknetProvider>
      <WalletComponent />
    </StarknetProvider>
  );
}

function WalletComponent() {
  const { connect, isConnected, accountInfo } = useStarknet();
  
  return (
    <div>
      {isConnected ? (
        <p>ETH Balance: {accountInfo?.balance}</p>
      ) : (
        <button onClick={() => connect()}>Connect</button>
      )}
    </div>
  );
}
```

### Custom Balance Token
```tsx
// Use STRK token for primary balance instead of ETH
const strkAddress = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

<StarknetProvider balanceTokenAddress={strkAddress}>
  <App />
</StarknetProvider>
```

### Multiple Token Support
```tsx
const customTokens = [
  { address: "0x049d...", symbol: "ETH", name: "Ethereum", decimals: 18 },
  { address: "0x0471...", symbol: "STRK", name: "Starknet Token", decimals: 18 },
  { address: "0x053c...", symbol: "USDC", name: "USD Coin", decimals: 6 },
  { address: "0x...custom", symbol: "CUSTOM", name: "My Token", decimals: 18 },
];

<StarknetProvider supportedTokens={customTokens}>
  <MultiTokenApp />
</StarknetProvider>
```

## StarknetProvider Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultRpcUrl` | string | Sepolia RPC | RPC endpoint URL |
| `defaultChainId` | string | "SN_SEPOLIA" | Network chain ID |
| `balanceTokenAddress` | string | Network ETH | Token for primary balance |
| `supportedTokens` | TokenInfo[] | Network defaults | Supported token list |

## Default Token Addresses

### Mainnet
- **ETH**: `0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7`
- **STRK**: `0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d`
- **USDC**: `0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8`

### Sepolia & Devnet
- Same addresses as mainnet (for testnet compatibility)

## Enhanced Hook Methods

### Balance Management
```tsx
const { 
  getBalance,           // Get balance for specific token
  getTokenBalance,      // Get balance for token by address  
  getAllBalances,       // Get all supported token balances
  balanceTokenAddress,  // Current primary balance token
  supportedTokens       // List of supported tokens
} = useStarknet();

// Get ETH balance for current account
const ethBalance = await getBalance();

// Get STRK balance for current account  
const strkBalance = await getBalance(undefined, strkTokenAddress);

// Get USDC balance for specific address
const usdcBalance = await getTokenBalance(usdcTokenAddress, "0x123...");

// Get all token balances
const allBalances = await getAllBalances(); // { ETH: "1.5", STRK: "100", USDC: "50" }
```

### Runtime Configuration
```tsx
const { 
  setBalanceTokenAddress, 
  addSupportedToken 
} = useStarknet();

// Change primary balance token to STRK
setBalanceTokenAddress("0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d");

// Add custom token to supported list
addSupportedToken({
  address: "0x...custom",
  symbol: "MYTOKEN", 
  name: "My Custom Token",
  decimals: 18
});
```

## Network Configuration

### Automatic Network Detection
The connector automatically selects appropriate token defaults based on the network:

```tsx
// Sepolia network - uses Sepolia token addresses
<StarknetProvider defaultChainId="SN_SEPOLIA">
  <App />
</StarknetProvider>

// Mainnet network - uses Mainnet token addresses  
<StarknetProvider defaultChainId="SN_MAIN">
  <App />
</StarknetProvider>
```

### Runtime Network Switching
```tsx
function NetworkSwitcher() {
  const { setProvider } = useStarknet();
  
  const switchToMainnet = () => {
    setProvider({
      rpcUrl: "https://starknet-mainnet.public.blastapi.io",
      chainId: "SN_MAIN"
    });
  };
  
  return <button onClick={switchToMainnet}>Switch to Mainnet</button>;
}
```

## Advanced Usage Patterns

### Multi-Token Balance Display
```tsx
function TokenBalancesList() {
  const { getAllBalances, supportedTokens } = useStarknet();
  const [balances, setBalances] = useState({});
  
  useEffect(() => {
    getAllBalances().then(setBalances);
  }, [getAllBalances]);
  
  return (
    <div>
      {supportedTokens.map(token => (
        <div key={token.symbol}>
          {token.symbol}: {balances[token.symbol] || '0'}
        </div>
      ))}
    </div>
  );
}
```

### Custom Token Management
```tsx
function CustomTokenManager() {
  const { addSupportedToken, supportedTokens } = useStarknet();
  const [tokenAddress, setTokenAddress] = useState("");
  
  const addCustomToken = () => {
    addSupportedToken({
      address: tokenAddress,
      symbol: "CUSTOM",
      name: "Custom Token", 
      decimals: 18
    });
  };
  
  return (
    <div>
      <input 
        value={tokenAddress}
        onChange={(e) => setTokenAddress(e.target.value)}
        placeholder="Token address"
      />
      <button onClick={addCustomToken}>Add Token</button>
      <p>Supported tokens: {supportedTokens.length}</p>
    </div>
  );
}
```

### Balance-Aware Components
```tsx
function TradeButton() {
  const { getAllBalances } = useStarknet();
  const [canTrade, setCanTrade] = useState(false);
  
  useEffect(() => {
    const checkBalances = async () => {
      const balances = await getAllBalances();
      const hasEth = parseFloat(balances.ETH || '0') > 0.01;
      const hasStrk = parseFloat(balances.STRK || '0') > 100;
      setCanTrade(hasEth && hasStrk);
    };
    
    checkBalances();
  }, [getAllBalances]);
  
  return (
    <button disabled={!canTrade}>
      {canTrade ? "Trade Now" : "Insufficient Balance"}
    </button>
  );
}
```

## TypeScript Interfaces

### TokenInfo
```typescript
interface TokenInfo {
  address: string;    // Contract address
  symbol: string;     // Token symbol (e.g., "ETH", "STRK")
  name: string;       // Human readable name
  decimals: number;   // Token decimals
}
```

### AccountInfo
```typescript
interface AccountInfo {
  address: string;                    // Account address
  publicKey?: string;                 // Public key if available
  balance?: string;                   // Primary token balance
  tokenBalances?: Record<string, string>; // All token balances
}
```

## Migration Guide

### From Original Version
**Before:**
```tsx
// Balance was always ETH, hard-coded
const { getBalance } = useStarknet();
const balance = await getBalance();
```

**After:**
```tsx
// Balance token is configurable, supports multiple tokens
const { getBalance, getTokenBalance, getAllBalances } = useStarknet();

// Same as before - primary balance token (default ETH)
const primaryBalance = await getBalance();

// Specific token balance
const strkBalance = await getTokenBalance(strkTokenAddress);

// All supported token balances
const allBalances = await getAllBalances();
```

### Custom Balance Token
**Before:** Not possible

**After:**
```tsx
// Method 1: Provider prop
<StarknetProvider balanceTokenAddress={myTokenAddress}>
  <App />
</StarknetProvider>

// Method 2: Runtime change
const { setBalanceTokenAddress } = useStarknet();
setBalanceTokenAddress(myTokenAddress);
```

## Best Practices

### 1. Network-Specific Configuration
```tsx
// Good: Let connector handle network defaults
<StarknetProvider defaultChainId="SN_MAIN" />

// Better: Provide custom tokens only when needed
<StarknetProvider 
  defaultChainId="SN_MAIN"
  supportedTokens={[...defaultTokens, customToken]}
/>
```

### 2. Error Handling
```tsx
const fetchBalances = async () => {
  try {
    const balances = await getAllBalances();
    setBalances(balances);
  } catch (error) {
    console.error("Failed to fetch balances:", error);
    // Show user-friendly error message
    setError("Unable to load token balances");
  }
};
```

### 3. Performance Optimization
```tsx
// Cache balances and refresh strategically
const [balances, setBalances] = useState({});
const [lastRefresh, setLastRefresh] = useState(0);

const refreshBalances = useCallback(async () => {
  const now = Date.now();
  if (now - lastRefresh < 30000) return; // 30 second cache
  
  const newBalances = await getAllBalances();
  setBalances(newBalances);
  setLastRefresh(now);
}, [getAllBalances, lastRefresh]);
```

### 4. Multi-Token UI Patterns
```tsx
// Sort tokens by balance for better UX
const sortedTokens = useMemo(() => {
  return supportedTokens
    .map(token => ({
      ...token,
      balance: parseFloat(balances[token.symbol] || '0')
    }))
    .sort((a, b) => b.balance - a.balance);
}, [supportedTokens, balances]);
```

This enhanced StarknetConnector provides the flexibility needed for modern DeFi and multi-token applications while maintaining simplicity for basic use cases.