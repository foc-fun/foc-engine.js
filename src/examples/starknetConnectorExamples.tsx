// Examples of how to use the enhanced StarknetConnector

import React from "react";
import { StarknetProvider, useStarknet, TokenInfo } from '../context/StarknetConnector';

// Example 1: Basic usage with default ETH balance
export function BasicStarknetApp() {
  return (
    <StarknetProvider>
      <MyApp />
    </StarknetProvider>
  );
}

function MyApp() {
  const { connect, getBalance, isConnected, accountInfo } = useStarknet();
  
  const handleConnect = async () => {
    await connect(); // Uses default balance token (ETH)
  };
  
  return (
    <div>
      {isConnected ? (
        <p>ETH Balance: {accountInfo?.balance}</p>
      ) : (
        <button onClick={handleConnect}>Connect Wallet</button>
      )}
    </div>
  );
}

// Example 2: Custom balance token (STRK instead of ETH)
export function StrkBalanceApp() {
  const strkTokenAddress = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
  
  return (
    <StarknetProvider balanceTokenAddress={strkTokenAddress}>
      <StrkApp />
    </StarknetProvider>
  );
}

function StrkApp() {
  const { isConnected, accountInfo } = useStarknet();
  
  return (
    <div>
      {isConnected && (
        <p>STRK Balance: {accountInfo?.balance}</p>
      )}
    </div>
  );
}

// Example 3: Custom supported tokens
export function MultiTokenApp() {
  const customTokens: TokenInfo[] = [
    { 
      address: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7", 
      symbol: "ETH", 
      name: "Ethereum", 
      decimals: 18 
    },
    { 
      address: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d", 
      symbol: "STRK", 
      name: "Starknet Token", 
      decimals: 18 
    },
    { 
      address: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8", 
      symbol: "USDC", 
      name: "USD Coin", 
      decimals: 6 
    },
    // Custom project token
    { 
      address: "0x...your_custom_token", 
      symbol: "CUSTOM", 
      name: "My Custom Token", 
      decimals: 18 
    },
  ];

  return (
    <StarknetProvider supportedTokens={customTokens}>
      <TokenBalancesDisplay />
    </StarknetProvider>
  );
}

function TokenBalancesDisplay() {
  const { getAllBalances, supportedTokens, isConnected } = useStarknet();
  const [balances, setBalances] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);

  const fetchAllBalances = async () => {
    if (!isConnected) return;
    
    setLoading(true);
    try {
      const tokenBalances = await getAllBalances();
      setBalances(tokenBalances);
    } catch (error) {
      console.error("Failed to fetch balances:", error);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    if (isConnected) {
      fetchAllBalances();
    }
  }, [isConnected]);

  return (
    <div>
      <h3>Token Balances</h3>
      {loading ? (
        <p>Loading balances...</p>
      ) : (
        <div>
          {supportedTokens.map(token => (
            <div key={token.address}>
              <strong>{token.symbol}</strong>: {balances[token.symbol] || '0'}
            </div>
          ))}
        </div>
      )}
      <button onClick={fetchAllBalances} disabled={!isConnected || loading}>
        Refresh Balances
      </button>
    </div>
  );
}

// Example 4: Runtime configuration
export function ConfigurableTokenApp() {
  return (
    <StarknetProvider>
      <TokenConfiguration />
    </StarknetProvider>
  );
}

function TokenConfiguration() {
  const { 
    balanceTokenAddress, 
    setBalanceTokenAddress, 
    addSupportedToken, 
    getTokenBalance,
    supportedTokens 
  } = useStarknet();
  
  const [customTokenAddress, setCustomTokenAddress] = React.useState("");
  const [customBalance, setCustomBalance] = React.useState("");

  const handleSetBalanceToken = () => {
    if (customTokenAddress) {
      setBalanceTokenAddress(customTokenAddress);
    }
  };

  const handleAddToken = () => {
    if (customTokenAddress) {
      const newToken: TokenInfo = {
        address: customTokenAddress,
        symbol: "CUSTOM",
        name: "Custom Token",
        decimals: 18
      };
      addSupportedToken(newToken);
    }
  };

  const handleGetCustomBalance = async () => {
    if (customTokenAddress) {
      try {
        const balance = await getTokenBalance(customTokenAddress);
        setCustomBalance(balance);
      } catch (error) {
        console.error("Failed to get custom token balance:", error);
        setCustomBalance("Error");
      }
    }
  };

  return (
    <div>
      <div>
        <h3>Current Configuration</h3>
        <p>Balance Token: {balanceTokenAddress}</p>
        <p>Supported Tokens: {supportedTokens.length}</p>
      </div>
      
      <div>
        <h3>Add Custom Token</h3>
        <input 
          type="text"
          placeholder="Token contract address"
          value={customTokenAddress}
          onChange={(e) => setCustomTokenAddress(e.target.value)}
        />
        <button onClick={handleSetBalanceToken}>Set as Balance Token</button>
        <button onClick={handleAddToken}>Add to Supported Tokens</button>
        <button onClick={handleGetCustomBalance}>Get Balance</button>
        {customBalance && <p>Custom Token Balance: {customBalance}</p>}
      </div>
    </div>
  );
}

// Example 5: Multi-network support
export function MultiNetworkApp() {
  const [network, setNetwork] = React.useState<"mainnet" | "sepolia" | "devnet">("sepolia");
  
  const networkConfigs = {
    mainnet: {
      rpcUrl: "https://starknet-mainnet.public.blastapi.io",
      chainId: "SN_MAIN"
    },
    sepolia: {
      rpcUrl: "https://starknet-sepolia.public.blastapi.io",
      chainId: "SN_SEPOLIA"
    },
    devnet: {
      rpcUrl: "http://localhost:5050",
      chainId: "SN_DEVNET"
    }
  };

  return (
    <StarknetProvider 
      defaultRpcUrl={networkConfigs[network].rpcUrl}
      defaultChainId={networkConfigs[network].chainId}
    >
      <NetworkSwitcher network={network} setNetwork={setNetwork} />
      <NetworkSpecificContent />
    </StarknetProvider>
  );
}

function NetworkSwitcher({ 
  network, 
  setNetwork 
}: { 
  network: string; 
  setNetwork: (network: "mainnet" | "sepolia" | "devnet") => void;
}) {
  const { setProvider } = useStarknet();

  const handleNetworkChange = (newNetwork: "mainnet" | "sepolia" | "devnet") => {
    const configs = {
      mainnet: { rpcUrl: "https://starknet-mainnet.public.blastapi.io", chainId: "SN_MAIN" },
      sepolia: { rpcUrl: "https://starknet-sepolia.public.blastapi.io", chainId: "SN_SEPOLIA" },
      devnet: { rpcUrl: "http://localhost:5050", chainId: "SN_DEVNET" }
    };
    
    setNetwork(newNetwork);
    setProvider(configs[newNetwork]);
  };

  return (
    <div>
      <h3>Network: {network}</h3>
      <button onClick={() => handleNetworkChange("mainnet")}>Mainnet</button>
      <button onClick={() => handleNetworkChange("sepolia")}>Sepolia</button>
      <button onClick={() => handleNetworkChange("devnet")}>Devnet</button>
    </div>
  );
}

function NetworkSpecificContent() {
  const { chainId, supportedTokens, balanceTokenAddress } = useStarknet();
  
  return (
    <div>
      <p>Chain ID: {chainId}</p>
      <p>Balance Token: {balanceTokenAddress}</p>
      <p>Available Tokens: {supportedTokens.map(t => t.symbol).join(", ")}</p>
    </div>
  );
}

// Example 6: Hook for easier balance management
export function useTokenBalances() {
  const { getAllBalances, getTokenBalance, supportedTokens, isConnected } = useStarknet();
  const [balances, setBalances] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);

  const refreshBalances = async () => {
    if (!isConnected) return;
    
    setLoading(true);
    try {
      const tokenBalances = await getAllBalances();
      setBalances(tokenBalances);
    } catch (error) {
      console.error("Failed to refresh balances:", error);
    }
    setLoading(false);
  };

  const getBalance = (symbol: string) => {
    return balances[symbol] || "0";
  };

  const hasBalance = (symbol: string, minAmount: string = "0") => {
    const balance = parseFloat(getBalance(symbol));
    const min = parseFloat(minAmount);
    return balance > min;
  };

  React.useEffect(() => {
    if (isConnected) {
      refreshBalances();
    }
  }, [isConnected, supportedTokens]);

  return {
    balances,
    loading,
    refreshBalances,
    getBalance,
    hasBalance,
    supportedTokens,
  };
}

// Usage of the custom hook
export function BalanceAwareComponent() {
  const { balances, loading, refreshBalances, hasBalance } = useTokenBalances();
  
  const canTrade = hasBalance("ETH", "0.01") && hasBalance("STRK", "100");
  
  return (
    <div>
      {loading ? (
        <p>Loading balances...</p>
      ) : (
        <div>
          <div>
            {Object.entries(balances).map(([symbol, balance]) => (
              <p key={symbol}>{symbol}: {balance}</p>
            ))}
          </div>
          
          <p>Can Trade: {canTrade ? "Yes" : "No"}</p>
          
          <button onClick={refreshBalances}>Refresh</button>
        </div>
      )}
    </div>
  );
}