# Enhanced OnchainActions Store

The OnchainActions store now supports comprehensive configuration through environment variables, runtime settings, and custom store creation with advanced batching and debouncing capabilities.

## Environment Variable Configuration

Set these environment variables to configure default behavior:

```bash
FOC_MAX_ACTIONS=100        # Maximum actions to queue (default: 50)
FOC_AUTO_INVOKE=true       # Enable automatic batch execution (default: true)
FOC_BATCH_SIZE=20          # Actions per batch (default: 10)
FOC_DEBOUNCE_MS=2000       # Debounce delay in milliseconds (default: 1000)
```

## Quick Start

### Basic Usage
```typescript
import { useOnchainActions } from 'foc-engine-js';

const { addAction, clearActions, forceBatchExecution } = useOnchainActions();

// Add actions - they'll be auto-batched based on configuration
addAction({
  contractAddress: "0x...",
  entrypoint: "transfer", 
  calldata: ["recipient", "amount", "0"]
});
```

### Configuration Management
```typescript
import { useOnchainActionsConfig } from 'foc-engine-js';

const { updateConfig, config, resetToDefaults } = useOnchainActionsConfig();

// Update specific settings
updateConfig({
  maxActions: 200,
  batchSize: 25,
  debounceMs: 3000
});

// Reset to environment defaults
resetToDefaults();
```

### Enhanced Manager API
```typescript
import { useOnchainActionsManager } from 'foc-engine-js';

const manager = useOnchainActionsManager();

// Cleaner API with utilities
manager.add(myAction);
manager.addMultiple([action1, action2, action3]);
manager.executeNow(); // Force immediate execution
console.log(`Queue has ${manager.actionCount} actions`);
```

## Advanced Usage

### Custom Store Creation
```typescript
import { createOnchainActionsStore, OnchainActionsConfig } from 'foc-engine-js';

const tradingConfig: OnchainActionsConfig = {
  maxActions: 500,
  batchSize: 10,
  debounceMs: 2000,
  autoInvoke: true,
  onBatchReady: async (actions) => {
    console.log(`Executing ${actions.length} trades`);
    // Custom execution logic
  },
  onError: (error, actions) => {
    console.error(`Batch failed:`, error);
    // Custom error handling
  }
};

const useTradingActions = createOnchainActionsStore(tradingConfig);
```

### Batching Strategies
```typescript
import { useOnchainActionsConfig } from 'foc-engine-js';

const { updateConfig } = useOnchainActionsConfig();

// Real-time strategy (immediate execution)
updateConfig({
  batchSize: 1,
  debounceMs: 0,
  autoInvoke: true
});

// Cost-optimized strategy (larger batches)
updateConfig({
  batchSize: 25,
  debounceMs: 5000,
  autoInvoke: true  
});

// Manual control strategy
updateConfig({
  autoInvoke: false,
  debounceMs: 0
});
```

## Configuration Options

### OnchainActionsConfig Interface
```typescript
interface OnchainActionsConfig {
  maxActions?: number;        // Maximum actions in queue
  autoInvoke?: boolean;       // Enable automatic execution
  batchSize?: number;         // Actions per batch
  debounceMs?: number;        // Debounce delay
  onBatchReady?: (actions: Call[]) => Promise<void>;  // Custom executor
  onError?: (error: Error, actions: Call[]) => void;  // Error handler
}
```

### Environment Variables
| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `FOC_MAX_ACTIONS` | number | 50 | Maximum actions in queue |
| `FOC_AUTO_INVOKE` | boolean | true | Enable auto-execution |
| `FOC_BATCH_SIZE` | number | 10 | Actions per batch |
| `FOC_DEBOUNCE_MS` | number | 1000 | Debounce delay in ms |

## Key Features

### 1. Smart Batching
- **Automatic**: Actions are batched when `batchSize` is reached
- **Debounced**: Remaining actions execute after `debounceMs` delay
- **Overflow Protection**: Excess actions beyond `maxActions` are managed

### 2. Execution Control
- **Auto-Invoke**: Automatic batch execution when conditions are met
- **Manual Control**: Disable auto-invoke for manual execution
- **Force Execution**: Execute current queue immediately

### 3. Error Handling
- **Retry Logic**: Failed actions can be re-queued
- **Custom Handlers**: Define custom error handling per store
- **Graceful Degradation**: System continues operating after errors

### 4. Performance Features
- **Debouncing**: Prevents excessive executions
- **Queue Management**: Automatic overflow handling
- **Memory Efficient**: Configurable limits prevent memory leaks

## Usage Patterns

### Gaming Applications
```typescript
const gameStore = createOnchainActionsStore({
  maxActions: 1000,
  batchSize: 15,
  debounceMs: 1500,
  onBatchReady: async (actions) => {
    await executeGameBatch(actions);
  }
});
```

### Trading Bots
```typescript
const tradingStore = createOnchainActionsStore({
  maxActions: 100,
  batchSize: 5,
  debounceMs: 2000,
  onBatchReady: async (actions) => {
    await executeTrades(actions);
  },
  onError: (error, actions) => {
    await handleTradingError(error, actions);
  }
});
```

### DeFi Applications
```typescript
const defiStore = createOnchainActionsStore({
  maxActions: 200,
  batchSize: 8,
  debounceMs: 3000,
  onBatchReady: async (actions) => {
    await executeDefiOperations(actions);
  }
});
```

## Migration Guide

### From Original Version
**Before:**
```typescript
const { addAction, setMaxActions } = useOnchainActions();
setMaxActions(100);
```

**After:**
```typescript
// Method 1: Environment variables
// Set FOC_MAX_ACTIONS=100

// Method 2: Runtime configuration  
const { updateConfig } = useOnchainActionsConfig();
updateConfig({ maxActions: 100 });

// Method 3: Custom store
const store = createOnchainActionsStore({ maxActions: 100 });
```

## Best Practices

### 1. Choose Appropriate Batch Size
- **Small batches (1-5)**: Low latency, higher gas costs
- **Medium batches (10-25)**: Balanced performance
- **Large batches (25+)**: Cost optimized, higher latency

### 2. Configure Debouncing
- **0ms**: Immediate execution when batch size is reached
- **1000-3000ms**: Good for most applications
- **5000ms+**: Cost-optimized for less time-sensitive operations

### 3. Environment Setup
```bash
# Development
FOC_MAX_ACTIONS=50
FOC_BATCH_SIZE=5
FOC_DEBOUNCE_MS=1000

# Production
FOC_MAX_ACTIONS=200
FOC_BATCH_SIZE=20
FOC_DEBOUNCE_MS=3000
```

### 4. Error Handling
Always implement custom error handlers for production:
```typescript
const config = {
  onError: (error, actions) => {
    // Log error
    console.error('Batch execution failed:', error);
    
    // Notify monitoring system
    analytics.track('batch_execution_failed', {
      error: error.message,
      actionCount: actions.length
    });
    
    // Implement retry logic if needed
    retryFailedActions(actions);
  }
};
```

## Performance Considerations

- **Memory Usage**: Set appropriate `maxActions` to prevent memory issues
- **Network Efficiency**: Use larger batch sizes to reduce network calls
- **User Experience**: Balance batch size with perceived responsiveness
- **Gas Optimization**: Larger batches reduce per-action gas overhead

This enhanced OnchainActions store provides the flexibility and performance needed for any blockchain application while maintaining simplicity for basic use cases.