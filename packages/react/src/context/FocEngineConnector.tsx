import React, { createContext, useContext, useCallback, useMemo, ReactNode } from "react";
import { Call } from "starknet";
import { FocEngine, Paymaster, normalizeNetworkName } from "@foc-engine/core";

export type NetworkName = 
  | "mainnet" | "sepolia" | "devnet"
  | "sn_mainnet" | "sn_sepolia" | "sn_devnet"
  | "SN_MAINNET" | "SN_SEPOLIA" | "SN_DEVNET";

export interface FocEngineConfig {
  network?: NetworkName;
  customUrl?: string;
}

export interface GaslessTxParams {
  calls: Call[];
  chainId?: string;
  nonce?: string;
  version?: string;
  maxFee?: string;
  resourceBounds?: any;
}

interface FocEngineContextType {
  engine: FocEngine | null;
  paymaster: Paymaster | null;
  isConnected: boolean;
  network: string;
  
  connect: (config?: FocEngineConfig) => void;
  disconnect: () => void;
  buildGaslessTx: (params: GaslessTxParams) => Promise<any>;
  sendGaslessTx: (signedTx: any) => Promise<any>;
  setNetwork: (network: NetworkName) => void;
}

const FocEngineContext = createContext<FocEngineContextType>({
  engine: null,
  paymaster: null,
  isConnected: false,
  network: "sepolia",
  connect: () => {},
  disconnect: () => {},
  buildGaslessTx: async () => null,
  sendGaslessTx: async () => null,
  setNetwork: () => {},
});

interface FocEngineProviderProps {
  children: ReactNode;
  defaultNetwork?: NetworkName;
  customUrl?: string;
}

export const FocEngineProvider: React.FC<FocEngineProviderProps> = ({
  children,
  defaultNetwork = "sepolia",
  customUrl,
}) => {
  const [engine, setEngine] = React.useState<FocEngine | null>(null);
  const [paymaster, setPaymaster] = React.useState<Paymaster | null>(null);
  const [network, setNetworkState] = React.useState<string>(() => {
    try {
      return normalizeNetworkName(defaultNetwork);
    } catch {
      return "SN_SEPOLIA"; // fallback
    }
  });
  const [isConnected, setIsConnected] = React.useState(false);

  const connect = useCallback((config?: FocEngineConfig) => {
    try {
      const networkToUse = config?.network || defaultNetwork;
      const urlToUse = config?.customUrl || customUrl;
      
      // Normalize the network name for internal use
      const normalizedNetwork = normalizeNetworkName(networkToUse);
      
      const newEngine = new FocEngine(normalizedNetwork, urlToUse);
      const newPaymaster = new Paymaster(newEngine);
      
      setEngine(newEngine);
      setPaymaster(newPaymaster);
      setNetworkState(normalizedNetwork);
      setIsConnected(true);
    } catch (error) {
      console.error("Failed to connect to FOC Engine:", error);
      setIsConnected(false);
    }
  }, [defaultNetwork, customUrl]);

  const disconnect = useCallback(() => {
    setEngine(null);
    setPaymaster(null);
    setIsConnected(false);
  }, []);

  const buildGaslessTx = useCallback(async (params: GaslessTxParams) => {
    if (!paymaster) {
      throw new Error("Paymaster not initialized. Call connect() first.");
    }
    
    return await paymaster.buildGaslessTx(params.calls, {
      chainId: params.chainId,
      nonce: params.nonce,
      version: params.version,
      maxFee: params.maxFee,
      resourceBounds: params.resourceBounds,
    });
  }, [paymaster]);

  const sendGaslessTx = useCallback(async (signedTx: any) => {
    if (!paymaster) {
      throw new Error("Paymaster not initialized. Call connect() first.");
    }
    
    return await paymaster.sendGaslessTx(signedTx);
  }, [paymaster]);

  const setNetwork = useCallback((newNetwork: NetworkName) => {
    const normalizedNetwork = normalizeNetworkName(newNetwork);
    if (isConnected) {
      connect({ network: newNetwork, customUrl });
    } else {
      setNetworkState(normalizedNetwork);
    }
  }, [isConnected, connect, customUrl]);

  React.useEffect(() => {
    if (defaultNetwork) {
      connect({ network: defaultNetwork, customUrl });
    }
  }, []);

  const contextValue = useMemo(() => ({
    engine,
    paymaster,
    isConnected,
    network,
    connect,
    disconnect,
    buildGaslessTx,
    sendGaslessTx,
    setNetwork,
  }), [
    engine,
    paymaster,
    isConnected,
    network,
    connect,
    disconnect,
    buildGaslessTx,
    sendGaslessTx,
    setNetwork,
  ]);

  return (
    <FocEngineContext.Provider value={contextValue}>
      {children}
    </FocEngineContext.Provider>
  );
};

export const useFocEngine = () => {
  const context = useContext(FocEngineContext);
  if (!context) {
    throw new Error("useFocEngine must be used within a FocEngineProvider");
  }
  return context;
};
