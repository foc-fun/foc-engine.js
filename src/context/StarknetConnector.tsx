import React, { createContext, useContext, useCallback, useMemo, ReactNode } from "react";
import { Account, Call, RpcProvider, Contract, cairo, num } from "starknet";

export interface StarknetConfig {
  rpcUrl?: string;
  chainId?: string;
}

export interface AccountInfo {
  address: string;
  publicKey?: string;
  balance?: string;
}

interface StarknetContextType {
  account: Account | null;
  provider: RpcProvider | null;
  isConnected: boolean;
  accountInfo: AccountInfo | null;
  chainId: string | null;
  
  connect: (accountAddress?: string, privateKey?: string, config?: StarknetConfig) => Promise<void>;
  disconnect: () => void;
  executeTransaction: (calls: Call[]) => Promise<any>;
  getBalance: (address?: string) => Promise<string>;
  getContract: (address: string, abi: any) => Contract;
  callContract: (contractAddress: string, functionName: string, calldata?: any[]) => Promise<any>;
  setProvider: (config: StarknetConfig) => void;
}

const StarknetContext = createContext<StarknetContextType>({
  account: null,
  provider: null,
  isConnected: false,
  accountInfo: null,
  chainId: null,
  connect: async () => {},
  disconnect: () => {},
  executeTransaction: async () => null,
  getBalance: async () => "0",
  getContract: () => null as any,
  callContract: async () => null,
  setProvider: () => {},
});

interface StarknetProviderProps {
  children: ReactNode;
  defaultRpcUrl?: string;
  defaultChainId?: string;
}

export const StarknetProvider: React.FC<StarknetProviderProps> = ({
  children,
  defaultRpcUrl = "https://starknet-sepolia.public.blastapi.io",
  defaultChainId = "SN_SEPOLIA",
}) => {
  const [account, setAccount] = React.useState<Account | null>(null);
  const [provider, setProviderState] = React.useState<RpcProvider | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const [accountInfo, setAccountInfo] = React.useState<AccountInfo | null>(null);
  const [chainId, setChainId] = React.useState<string | null>(defaultChainId);

  const initProvider = useCallback((config?: StarknetConfig) => {
    const rpcUrl = config?.rpcUrl || defaultRpcUrl;
    const chain = config?.chainId || defaultChainId;
    
    const newProvider = new RpcProvider({
      nodeUrl: rpcUrl,
    });
    
    setProviderState(newProvider);
    setChainId(chain);
    return newProvider;
  }, [defaultRpcUrl, defaultChainId]);

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
          contractAddress: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
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

  const getBalance = useCallback(async (address?: string) => {
    if (!provider) {
      throw new Error("Provider not initialized");
    }
    
    const targetAddress = address || accountInfo?.address;
    if (!targetAddress) {
      throw new Error("No address provided");
    }
    
    try {
      const balance = await provider.callContract({
        contractAddress: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        entrypoint: "balanceOf",
        calldata: [targetAddress],
      });
      
      return num.hexToDecimalString(balance[0] as string);
    } catch (error) {
      console.error("Failed to get balance:", error);
      return "0";
    }
  }, [provider, accountInfo]);

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
  }, [initProvider]);

  React.useEffect(() => {
    initProvider();
  }, [initProvider]);

  const contextValue = useMemo(() => ({
    account,
    provider,
    isConnected,
    accountInfo,
    chainId,
    connect,
    disconnect,
    executeTransaction,
    getBalance,
    getContract,
    callContract,
    setProvider,
  }), [
    account,
    provider,
    isConnected,
    accountInfo,
    chainId,
    connect,
    disconnect,
    executeTransaction,
    getBalance,
    getContract,
    callContract,
    setProvider,
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