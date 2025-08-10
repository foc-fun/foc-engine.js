import React, { createContext, useContext, useCallback, useMemo, ReactNode } from "react";
import { Account, Call, RpcProvider, Contract, num } from "starknet";

// Default token addresses for different networks
const DEFAULT_TOKENS = {
  mainnet: {
    ETH: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    STRK: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    USDC: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
  },
  sepolia: {
    ETH: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    STRK: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d", 
  },
  devnet: {
    ETH: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    STRK: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
  },
};

const DEFAULT_TOKEN_INFO: Record<string, TokenInfo[]> = {
  mainnet: [
    { address: DEFAULT_TOKENS.mainnet.ETH, symbol: "ETH", name: "Ethereum", decimals: 18 },
    { address: DEFAULT_TOKENS.mainnet.STRK, symbol: "STRK", name: "Starknet Token", decimals: 18 },
    { address: DEFAULT_TOKENS.mainnet.USDC, symbol: "USDC", name: "USD Coin", decimals: 6 },
  ],
  sepolia: [
    { address: DEFAULT_TOKENS.sepolia.ETH, symbol: "ETH", name: "Ethereum", decimals: 18 },
    { address: DEFAULT_TOKENS.sepolia.STRK, symbol: "STRK", name: "Starknet Token", decimals: 18 },
  ],
  devnet: [
    { address: DEFAULT_TOKENS.devnet.ETH, symbol: "ETH", name: "Ethereum", decimals: 18 },
    { address: DEFAULT_TOKENS.devnet.STRK, symbol: "STRK", name: "Starknet Token", decimals: 18 },
  ],
};

function getDefaultBalanceToken(chainId: string): string {
  switch (chainId.toLowerCase()) {
    case "sn_main":
    case "mainnet":
      return DEFAULT_TOKENS.mainnet.ETH;
    case "sn_sepolia":
    case "sepolia":
      return DEFAULT_TOKENS.sepolia.ETH;
    case "sn_devnet":
    case "devnet":
      return DEFAULT_TOKENS.devnet.ETH;
    default:
      return DEFAULT_TOKENS.sepolia.ETH;
  }
}

function getDefaultSupportedTokens(chainId: string): TokenInfo[] {
  switch (chainId.toLowerCase()) {
    case "sn_main":
    case "mainnet":
      return DEFAULT_TOKEN_INFO.mainnet;
    case "sn_sepolia":
    case "sepolia":
      return DEFAULT_TOKEN_INFO.sepolia;
    case "sn_devnet":
    case "devnet":
      return DEFAULT_TOKEN_INFO.devnet;
    default:
      return DEFAULT_TOKEN_INFO.sepolia;
  }
}

export interface StarknetConfig {
  rpcUrl?: string;
  chainId?: string;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}

export interface AccountInfo {
  address: string;
  publicKey?: string;
  balance?: string;
  tokenBalances?: Record<string, string>;
}

interface StarknetContextType {
  account: Account | null;
  provider: RpcProvider | null;
  isConnected: boolean;
  accountInfo: AccountInfo | null;
  chainId: string | null;
  balanceTokenAddress: string;
  supportedTokens: TokenInfo[];
  
  connect: (accountAddress?: string, privateKey?: string, config?: StarknetConfig) => Promise<void>;
  disconnect: () => void;
  executeTransaction: (calls: Call[]) => Promise<any>;
  getBalance: (address?: string, tokenAddress?: string) => Promise<string>;
  getTokenBalance: (tokenAddress: string, accountAddress?: string) => Promise<string>;
  getAllBalances: (accountAddress?: string) => Promise<Record<string, string>>;
  getContract: (address: string, abi: any) => Contract;
  callContract: (contractAddress: string, functionName: string, calldata?: any[]) => Promise<any>;
  setProvider: (config: StarknetConfig) => void;
  setBalanceTokenAddress: (address: string) => void;
  addSupportedToken: (token: TokenInfo) => void;
}

const StarknetContext = createContext<StarknetContextType>({
  account: null,
  provider: null,
  isConnected: false,
  accountInfo: null,
  chainId: null,
  balanceTokenAddress: "",
  supportedTokens: [],
  connect: async () => {},
  disconnect: () => {},
  executeTransaction: async () => null,
  getBalance: async () => "0",
  getTokenBalance: async () => "0",
  getAllBalances: async () => ({}),
  getContract: () => null as any,
  callContract: async () => null,
  setProvider: () => {},
  setBalanceTokenAddress: () => {},
  addSupportedToken: () => {},
});

interface StarknetProviderProps {
  children: ReactNode;
  defaultRpcUrl?: string;
  defaultChainId?: string;
  balanceTokenAddress?: string;
  supportedTokens?: TokenInfo[];
}

export const StarknetProvider: React.FC<StarknetProviderProps> = ({
  children,
  defaultRpcUrl = "https://starknet-sepolia.public.blastapi.io",
  defaultChainId = "SN_SEPOLIA",
  balanceTokenAddress,
  supportedTokens,
}) => {
  const [account, setAccount] = React.useState<Account | null>(null);
  const [provider, setProviderState] = React.useState<RpcProvider | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const [accountInfo, setAccountInfo] = React.useState<AccountInfo | null>(null);
  const [chainId, setChainId] = React.useState<string | null>(defaultChainId);
  const [balanceToken, setBalanceToken] = React.useState<string>(
    balanceTokenAddress || getDefaultBalanceToken(defaultChainId)
  );
  const [tokens, setTokens] = React.useState<TokenInfo[]>(
    supportedTokens || getDefaultSupportedTokens(defaultChainId)
  );

  const initProvider = useCallback((config?: StarknetConfig) => {
    const rpcUrl = config?.rpcUrl || defaultRpcUrl;
    const chain = config?.chainId || defaultChainId;
    
    const newProvider = new RpcProvider({
      nodeUrl: rpcUrl,
    });
    
    setProviderState(newProvider);
    
    // Update chain-dependent defaults if chain changed
    if (chain !== chainId) {
      setChainId(chain);
      
      // Only update defaults if user hasn't provided custom values
      if (!balanceTokenAddress) {
        setBalanceToken(getDefaultBalanceToken(chain));
      }
      if (!supportedTokens) {
        setTokens(getDefaultSupportedTokens(chain));
      }
    }
    
    return newProvider;
  }, [defaultRpcUrl, defaultChainId, chainId, balanceTokenAddress, supportedTokens]);

  const connect = useCallback(async (
    accountAddress?: string, 
    privateKey?: string, 
    config?: StarknetConfig
  ) => {
    try {
      const currentProvider = provider || initProvider(config);
      
      if (accountAddress && privateKey) {
        const newAccount = new Account(currentProvider, accountAddress, privateKey);
        
        const balance = await currentProvider.callContract({
          contractAddress: balanceToken,
          entrypoint: "balanceOf",
          calldata: [accountAddress],
        });
        
        const accountData: AccountInfo = {
          address: accountAddress,
          balance: num.hexToDecimalString(balance[0] as string),
        };
        
        setAccount(newAccount);
        setAccountInfo(accountData);
        setIsConnected(true);
      } else if (typeof window !== "undefined" && (window as any).starknet) {
        const starknetWindowObject = (window as any).starknet;
        const [walletAddress] = await starknetWindowObject.enable();
        
        if (walletAddress) {
          const newAccount = new Account(
            currentProvider,
            walletAddress,
            starknetWindowObject.signer
          );
          
          const accountData: AccountInfo = {
            address: walletAddress,
          };
          
          setAccount(newAccount);
          setAccountInfo(accountData);
          setIsConnected(true);
        }
      } else {
        throw new Error("No wallet connection available");
      }
    } catch (error) {
      console.error("Failed to connect to Starknet:", error);
      setIsConnected(false);
    }
  }, [provider, initProvider]);

  const disconnect = useCallback(() => {
    setAccount(null);
    setAccountInfo(null);
    setIsConnected(false);
  }, []);

  const executeTransaction = useCallback(async (calls: Call[]) => {
    if (!account) {
      throw new Error("Account not connected");
    }
    
    return await account.execute(calls);
  }, [account]);

  const getBalance = useCallback(async (address?: string, tokenAddress?: string) => {
    if (!provider) {
      throw new Error("Provider not initialized");
    }
    
    const targetAddress = address || accountInfo?.address;
    if (!targetAddress) {
      throw new Error("No address provided");
    }
    
    const tokenContract = tokenAddress || balanceToken;
    
    try {
      const balance = await provider.callContract({
        contractAddress: tokenContract,
        entrypoint: "balanceOf",
        calldata: [targetAddress],
      });
      
      return num.hexToDecimalString(balance[0] as string);
    } catch (error) {
      console.error("Failed to get balance:", error);
      return "0";
    }
  }, [provider, accountInfo, balanceToken]);

  const getTokenBalance = useCallback(async (tokenAddress: string, accountAddress?: string) => {
    return getBalance(accountAddress, tokenAddress);
  }, [getBalance]);

  const getAllBalances = useCallback(async (accountAddress?: string) => {
    const targetAddress = accountAddress || accountInfo?.address;
    if (!targetAddress || !provider) {
      return {};
    }

    const balances: Record<string, string> = {};
    
    // Get balances for all supported tokens
    await Promise.allSettled(
      tokens.map(async (token) => {
        try {
          const balance = await getTokenBalance(token.address, targetAddress);
          balances[token.symbol] = balance;
        } catch (error) {
          console.error(`Failed to get balance for ${token.symbol}:`, error);
          balances[token.symbol] = "0";
        }
      })
    );

    return balances;
  }, [provider, accountInfo, tokens, getTokenBalance]);

  const getContract = useCallback((address: string, abi: any) => {
    if (!provider) {
      throw new Error("Provider not initialized");
    }
    
    return new Contract(abi, address, provider);
  }, [provider]);

  const callContract = useCallback(async (
    contractAddress: string, 
    functionName: string, 
    calldata: any[] = []
  ) => {
    if (!provider) {
      throw new Error("Provider not initialized");
    }
    
    return await provider.callContract({
      contractAddress,
      entrypoint: functionName,
      calldata,
    });
  }, [provider]);

  const setProvider = useCallback((config: StarknetConfig) => {
    initProvider(config);
    
    // Update balance token and supported tokens if chain changed
    if (config.chainId && config.chainId !== chainId) {
      if (!balanceTokenAddress) {
        setBalanceToken(getDefaultBalanceToken(config.chainId));
      }
      if (!supportedTokens) {
        setTokens(getDefaultSupportedTokens(config.chainId));
      }
    }
  }, [initProvider, chainId, balanceTokenAddress, supportedTokens]);

  const setBalanceTokenAddress = useCallback((address: string) => {
    setBalanceToken(address);
  }, []);

  const addSupportedToken = useCallback((token: TokenInfo) => {
    setTokens(prev => {
      const existing = prev.find(t => t.address === token.address);
      if (existing) {
        return prev.map(t => t.address === token.address ? token : t);
      }
      return [...prev, token];
    });
  }, []);

  React.useEffect(() => {
    initProvider();
  }, [initProvider]);

  const contextValue = useMemo(() => ({
    account,
    provider,
    isConnected,
    accountInfo,
    chainId,
    balanceTokenAddress: balanceToken,
    supportedTokens: tokens,
    connect,
    disconnect,
    executeTransaction,
    getBalance,
    getTokenBalance,
    getAllBalances,
    getContract,
    callContract,
    setProvider,
    setBalanceTokenAddress,
    addSupportedToken,
  }), [
    account,
    provider,
    isConnected,
    accountInfo,
    chainId,
    balanceToken,
    tokens,
    connect,
    disconnect,
    executeTransaction,
    getBalance,
    getTokenBalance,
    getAllBalances,
    getContract,
    callContract,
    setProvider,
    setBalanceTokenAddress,
    addSupportedToken,
  ]);

  return (
    <StarknetContext.Provider value={contextValue}>
      {children}
    </StarknetContext.Provider>
  );
};

export const useStarknet = () => {
  const context = useContext(StarknetContext);
  if (!context) {
    throw new Error("useStarknet must be used within a StarknetProvider");
  }
  return context;
};
