// Examples of how to use the enhanced useOnchainActions store

import { Call } from "starknet";
import { 
  useOnchainActions, 
  useOnchainActionsConfig, 
  useOnchainActionsManager,
  createOnchainActionsStore,
  OnchainActionsConfig 
} from '@foc-engine/core';

// Example 1: Using environment variables for configuration
/*
Set these environment variables:
FOC_MAX_ACTIONS=100
FOC_AUTO_INVOKE=true
FOC_BATCH_SIZE=20
FOC_DEBOUNCE_MS=2000
*/

export function useEnvironmentConfiguredActions() {
  // The store will automatically use environment variables
  const { config, setEnvironmentDefaults } = useOnchainActionsConfig();
  
  // Manually reload environment config if needed
  const reloadEnvConfig = () => {
    setEnvironmentDefaults();
  };
  
  return { config, reloadEnvConfig };
}

// Example 2: Runtime configuration
export function useRuntimeConfiguredActions() {
  const { updateConfig, config, resetToDefaults } = useOnchainActionsConfig();
  
  const setupForHighThroughput = () => {
    updateConfig({
      maxActions: 1000,
      batchSize: 50,
      debounceMs: 500,
      autoInvoke: true,
    });
  };
  
  const setupForLowLatency = () => {
    updateConfig({
      maxActions: 10,
      batchSize: 1,
      debounceMs: 0,
      autoInvoke: true,
    });
  };
  
  const setupForManualControl = () => {
    updateConfig({
      maxActions: 200,
      batchSize: 25,
      debounceMs: 5000,
      autoInvoke: false,
    });
  };
  
  return {
    config,
    setupForHighThroughput,
    setupForLowLatency,
    setupForManualControl,
    resetToDefaults,
  };
}

// Example 3: Using the enhanced manager API
export function useSimpleActionManager() {
  const manager = useOnchainActionsManager();
  
  const addTransferAction = (to: string, amount: string) => {
    const transferCall: Call = {
      contractAddress: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      entrypoint: "transfer",
      calldata: [to, amount, "0"]
    };
    
    manager.add(transferCall);
  };
  
  const addApprovalAction = (spender: string, amount: string) => {
    const approvalCall: Call = {
      contractAddress: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      entrypoint: "approve",
      calldata: [spender, amount, "0"]
    };
    
    manager.add(approvalCall);
  };
  
  return {
    ...manager,
    addTransferAction,
    addApprovalAction,
    
    // Convenience methods
    hasTransfers: () => manager.actions.some(action => action.entrypoint === "transfer"),
    hasApprovals: () => manager.actions.some(action => action.entrypoint === "approve"),
    getTransferCount: () => manager.actions.filter(action => action.entrypoint === "transfer").length,
    getApprovalCount: () => manager.actions.filter(action => action.entrypoint === "approve").length,
  };
}

// Example 4: Creating a custom configured store
const gameActionsConfig: OnchainActionsConfig = {
  maxActions: 500,
  batchSize: 10,
  debounceMs: 1500,
  autoInvoke: true,
  onBatchReady: async (actions: Call[]) => {
    console.log(`Executing game batch with ${actions.length} actions`);
    // Custom game-specific batch execution logic here
  },
  onError: (error: Error, actions: Call[]) => {
    console.error(`Game batch failed with ${actions.length} actions:`, error);
    // Custom error handling for game actions
  },
};

export const useGameActions = createOnchainActionsStore(gameActionsConfig);

// Example 5: Trading bot configuration
export function useTradingBotActions() {
  const tradingConfig: OnchainActionsConfig = {
    maxActions: 100,
    batchSize: 5,
    debounceMs: 2000,
    autoInvoke: true,
    onBatchReady: async (actions: Call[]) => {
      // Custom trading execution logic
      console.log(`Executing trading batch: ${actions.length} trades`);
    },
  };
  
  const tradingStore = createOnchainActionsStore(tradingConfig);
  
  const addBuyOrder = (tokenAddress: string, amount: string, price: string) => {
    const buyCall: Call = {
      contractAddress: "0x...dex_contract",
      entrypoint: "buy",
      calldata: [tokenAddress, amount, price]
    };
    
    tradingStore.getState().addAction(buyCall);
  };
  
  const addSellOrder = (tokenAddress: string, amount: string, price: string) => {
    const sellCall: Call = {
      contractAddress: "0x...dex_contract", 
      entrypoint: "sell",
      calldata: [tokenAddress, amount, price]
    };
    
    tradingStore.getState().addAction(sellCall);
  };
  
  return {
    store: tradingStore,
    addBuyOrder,
    addSellOrder,
  };
}

// Example 6: React component integration
export function ActionQueueStatus() {
  const manager = useOnchainActionsManager();
  const config = useOnchainActionsConfig();
  
  const progress = manager.actionCount / config.config.maxActions;
  const isNearLimit = progress > 0.8;
  
  return {
    status: {
      actionCount: manager.actionCount,
      maxActions: config.config.maxActions,
      progress,
      isNearLimit,
      isEmpty: manager.isEmpty,
      isPending: manager.pendingInvoke,
    },
    
    actions: {
      executeNow: manager.executeNow,
      clearQueue: manager.clear,
      pauseAutoExecution: () => config.setAutoInvoke(false),
      resumeAutoExecution: () => config.setAutoInvoke(true),
    },
  };
}

// Example 7: Batch processing strategies
export function useBatchingStrategies() {
  const config = useOnchainActionsConfig();
  
  const strategies = {
    // Strategy for immediate execution
    realTime: () => config.updateConfig({
      batchSize: 1,
      debounceMs: 0,
      autoInvoke: true,
    }),
    
    // Strategy for cost optimization (larger batches)
    costOptimized: () => config.updateConfig({
      batchSize: 20,
      debounceMs: 5000,
      autoInvoke: true,
    }),
    
    // Strategy for network congestion
    networkFriendly: () => config.updateConfig({
      batchSize: 5,
      debounceMs: 3000,
      autoInvoke: true,
    }),
    
    // Strategy for manual control
    manual: () => config.updateConfig({
      autoInvoke: false,
      debounceMs: 0,
    }),
  };
  
  return {
    currentConfig: config.config,
    applyStrategy: (strategyName: keyof typeof strategies) => {
      strategies[strategyName]();
    },
    strategies,
  };
}