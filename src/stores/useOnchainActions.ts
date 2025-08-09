import { create } from "zustand";
import { Call } from "starknet";

export interface OnchainActionsConfig {
  maxActions?: number;
  autoInvoke?: boolean;
  batchSize?: number;
  debounceMs?: number;
  onBatchReady?: (actions: Call[]) => Promise<void>;
  onError?: (error: Error, actions: Call[]) => void;
}

export interface OnchainActionsState {
  actions: Call[];
  maxActions: number;
  autoInvoke: boolean;
  batchSize: number;
  debounceMs: number;
  
  // Core functionality
  addAction: (action: Call) => void;
  addActions: (actions: Call[]) => void;
  clearActions: () => void;
  getActions: () => Call[];
  
  // Configuration
  setMaxActions: (max: number) => void;
  setAutoInvoke: (enabled: boolean) => void;
  setBatchSize: (size: number) => void;
  setDebounceMs: (ms: number) => void;
  updateConfig: (config: Partial<OnchainActionsConfig>) => void;
  getConfig: () => OnchainActionsConfig;
  
  // Advanced functionality
  invokeActions?: (actions: Call[]) => Promise<void>;
  onInvokeActions: (invokeActions: (actions: Call[]) => Promise<void>) => void;
  forceBatchExecution: () => Promise<void>;
  
  // Internal state
  pendingInvoke: boolean;
  lastInvokeTime: number;
  debounceTimer?: NodeJS.Timeout;
}

// Utility functions for environment variable support
function getEnvNumber(envKey: string, defaultValue: number): number {
  if (typeof process !== 'undefined' && process.env) {
    const envValue = process.env[envKey];
    if (envValue !== undefined && !isNaN(Number(envValue))) {
      return Number(envValue);
    }
  }
  
  // Check browser environment variables (if available)
  if (typeof window !== 'undefined' && (window as any).env) {
    const envValue = (window as any).env[envKey];
    if (envValue !== undefined && !isNaN(Number(envValue))) {
      return Number(envValue);
    }
  }
  
  return defaultValue;
}

function getEnvBoolean(envKey: string, defaultValue: boolean): boolean {
  if (typeof process !== 'undefined' && process.env) {
    const envValue = process.env[envKey];
    if (envValue !== undefined) {
      return envValue.toLowerCase() === 'true' || envValue === '1';
    }
  }
  
  if (typeof window !== 'undefined' && (window as any).env) {
    const envValue = (window as any).env[envKey];
    if (envValue !== undefined) {
      return envValue.toLowerCase() === 'true' || envValue === '1';
    }
  }
  
  return defaultValue;
}

// Default configuration with environment variable support
const getDefaultConfig = (): Required<OnchainActionsConfig> => ({
  maxActions: getEnvNumber('FOC_MAX_ACTIONS', 50),
  autoInvoke: getEnvBoolean('FOC_AUTO_INVOKE', true),
  batchSize: getEnvNumber('FOC_BATCH_SIZE', 10),
  debounceMs: getEnvNumber('FOC_DEBOUNCE_MS', 1000),
  onBatchReady: async () => {},
  onError: () => {},
});

export const useOnchainActions = create<OnchainActionsState>((set, get) => {
  const defaultConfig = getDefaultConfig();
  
  return {
    actions: [],
    maxActions: defaultConfig.maxActions,
    autoInvoke: defaultConfig.autoInvoke,
    batchSize: defaultConfig.batchSize,
    debounceMs: defaultConfig.debounceMs,
    pendingInvoke: false,
    lastInvokeTime: 0,
    debounceTimer: undefined,
    invokeActions: undefined,
    
    // Core functionality
    addAction: (action: Call) => {
      const state = get();
      const updatedActions = [...state.actions, action];
      
      set({ actions: updatedActions });
      
      // Check if we should auto-invoke
      if (state.autoInvoke && updatedActions.length >= state.batchSize) {
        get().forceBatchExecution();
      } else if (state.autoInvoke && state.debounceMs > 0) {
        // Set up debounced execution
        if (state.debounceTimer) {
          clearTimeout(state.debounceTimer);
        }
        
        const timer = setTimeout(() => {
          if (get().actions.length > 0) {
            get().forceBatchExecution();
          }
        }, state.debounceMs);
        
        set({ debounceTimer: timer });
      }
      
      // Handle overflow (when we exceed maxActions)
      if (updatedActions.length > state.maxActions) {
        const excess = updatedActions.length - state.maxActions;
        const toKeep = updatedActions.slice(excess);
        set({ actions: toKeep });
      }
    },
    
    addActions: (actions: Call[]) => {
      actions.forEach(action => get().addAction(action));
    },
    
    clearActions: () => {
      const state = get();
      if (state.debounceTimer) {
        clearTimeout(state.debounceTimer);
      }
      set({ actions: [], debounceTimer: undefined });
    },
    
    getActions: () => get().actions,
    
    // Configuration methods
    setMaxActions: (max: number) => {
      if (max > 0) {
        set({ maxActions: max });
      }
    },
    
    setAutoInvoke: (enabled: boolean) => {
      set({ autoInvoke: enabled });
    },
    
    setBatchSize: (size: number) => {
      if (size > 0) {
        set({ batchSize: size });
      }
    },
    
    setDebounceMs: (ms: number) => {
      if (ms >= 0) {
        set({ debounceMs: ms });
      }
    },
    
    updateConfig: (config: Partial<OnchainActionsConfig>) => {
      if (config.maxActions !== undefined) get().setMaxActions(config.maxActions);
      if (config.autoInvoke !== undefined) get().setAutoInvoke(config.autoInvoke);
      if (config.batchSize !== undefined) get().setBatchSize(config.batchSize);
      if (config.debounceMs !== undefined) get().setDebounceMs(config.debounceMs);
    },
    
    getConfig: (): OnchainActionsConfig => {
      const state = get();
      return {
        maxActions: state.maxActions,
        autoInvoke: state.autoInvoke,
        batchSize: state.batchSize,
        debounceMs: state.debounceMs,
      };
    },
    
    // Advanced functionality
    onInvokeActions: (invokeActions) => {
      set({ invokeActions });
    },
    
    forceBatchExecution: async () => {
      const state = get();
      
      if (state.pendingInvoke || state.actions.length === 0 || !state.invokeActions) {
        return;
      }
      
      set({ pendingInvoke: true });
      
      // Clear debounce timer if active
      if (state.debounceTimer) {
        clearTimeout(state.debounceTimer);
        set({ debounceTimer: undefined });
      }
      
      const actionsToInvoke = [...state.actions];
      set({ actions: [], lastInvokeTime: Date.now() });
      
      try {
        await state.invokeActions(actionsToInvoke);
      } catch (error) {
        console.error("Error invoking actions:", error);
        // Optionally re-add failed actions back to the queue
        const currentActions = get().actions;
        set({ actions: [...actionsToInvoke, ...currentActions] });
      } finally {
        set({ pendingInvoke: false });
      }
    },
  };
});

// Factory function to create configured onchain actions store
export function createOnchainActionsStore(config?: Partial<OnchainActionsConfig>) {
  const defaultConfig = getDefaultConfig();
  const finalConfig = { ...defaultConfig, ...config };
  
  return create<OnchainActionsState>((set, get) => ({
    actions: [],
    maxActions: finalConfig.maxActions,
    autoInvoke: finalConfig.autoInvoke,
    batchSize: finalConfig.batchSize,
    debounceMs: finalConfig.debounceMs,
    pendingInvoke: false,
    lastInvokeTime: 0,
    debounceTimer: undefined,
    invokeActions: finalConfig.onBatchReady,
    
    // Implement the same methods as the default store
    addAction: (action: Call) => {
      const state = get();
      const updatedActions = [...state.actions, action];
      
      set({ actions: updatedActions });
      
      if (state.autoInvoke && updatedActions.length >= state.batchSize) {
        get().forceBatchExecution();
      } else if (state.autoInvoke && state.debounceMs > 0) {
        if (state.debounceTimer) {
          clearTimeout(state.debounceTimer);
        }
        
        const timer = setTimeout(() => {
          if (get().actions.length > 0) {
            get().forceBatchExecution();
          }
        }, state.debounceMs);
        
        set({ debounceTimer: timer });
      }
      
      if (updatedActions.length > state.maxActions) {
        const excess = updatedActions.length - state.maxActions;
        const toKeep = updatedActions.slice(excess);
        set({ actions: toKeep });
      }
    },
    
    addActions: (actions: Call[]) => {
      actions.forEach(action => get().addAction(action));
    },
    
    clearActions: () => {
      const state = get();
      if (state.debounceTimer) {
        clearTimeout(state.debounceTimer);
      }
      set({ actions: [], debounceTimer: undefined });
    },
    
    getActions: () => get().actions,
    
    setMaxActions: (max: number) => {
      if (max > 0) set({ maxActions: max });
    },
    
    setAutoInvoke: (enabled: boolean) => {
      set({ autoInvoke: enabled });
    },
    
    setBatchSize: (size: number) => {
      if (size > 0) set({ batchSize: size });
    },
    
    setDebounceMs: (ms: number) => {
      if (ms >= 0) set({ debounceMs: ms });
    },
    
    updateConfig: (config: Partial<OnchainActionsConfig>) => {
      if (config.maxActions !== undefined) get().setMaxActions(config.maxActions);
      if (config.autoInvoke !== undefined) get().setAutoInvoke(config.autoInvoke);
      if (config.batchSize !== undefined) get().setBatchSize(config.batchSize);
      if (config.debounceMs !== undefined) get().setDebounceMs(config.debounceMs);
    },
    
    getConfig: (): OnchainActionsConfig => {
      const state = get();
      return {
        maxActions: state.maxActions,
        autoInvoke: state.autoInvoke,
        batchSize: state.batchSize,
        debounceMs: state.debounceMs,
      };
    },
    
    onInvokeActions: (invokeActions) => {
      set({ invokeActions });
    },
    
    forceBatchExecution: async () => {
      const state = get();
      
      if (state.pendingInvoke || state.actions.length === 0 || !state.invokeActions) {
        return;
      }
      
      set({ pendingInvoke: true });
      
      if (state.debounceTimer) {
        clearTimeout(state.debounceTimer);
        set({ debounceTimer: undefined });
      }
      
      const actionsToInvoke = [...state.actions];
      set({ actions: [], lastInvokeTime: Date.now() });
      
      try {
        await state.invokeActions(actionsToInvoke);
      } catch (error) {
        console.error("Error invoking actions:", error);
        if (finalConfig.onError) {
          finalConfig.onError(error as Error, actionsToInvoke);
        }
        const currentActions = get().actions;
        set({ actions: [...actionsToInvoke, ...currentActions] });
      } finally {
        set({ pendingInvoke: false });
      }
    },
  }));
}

// Hook for easier configuration management
export function useOnchainActionsConfig() {
  const {
    maxActions,
    autoInvoke,
    batchSize,
    debounceMs,
    setMaxActions,
    setAutoInvoke,
    setBatchSize,
    setDebounceMs,
    updateConfig,
    getConfig,
  } = useOnchainActions();

  return {
    config: {
      maxActions,
      autoInvoke,
      batchSize,
      debounceMs,
    },
    setMaxActions,
    setAutoInvoke,
    setBatchSize,
    setDebounceMs,
    updateConfig,
    getConfig,
    
    // Convenience methods
    resetToDefaults: () => {
      const defaults = getDefaultConfig();
      updateConfig(defaults);
    },
    
    setEnvironmentDefaults: () => {
      const envConfig = getDefaultConfig();
      updateConfig(envConfig);
    },
  };
}

// Hook for action management with better API
export function useOnchainActionsManager() {
  const {
    actions,
    pendingInvoke,
    addAction,
    addActions,
    clearActions,
    getActions,
    forceBatchExecution,
    onInvokeActions,
  } = useOnchainActions();

  return {
    actions,
    pendingInvoke,
    actionCount: actions.length,
    isEmpty: actions.length === 0,
    
    // Action management
    add: addAction,
    addMultiple: addActions,
    clear: clearActions,
    getAll: getActions,
    
    // Execution control
    executeNow: forceBatchExecution,
    setExecutor: onInvokeActions,
    
    // Utilities
    hasActions: () => actions.length > 0,
    getLastAction: () => actions[actions.length - 1] || null,
    getFirstAction: () => actions[0] || null,
  };
}