# Configurable EventManager

The EventManager in foc-engine-js now supports user-defined event types, making it flexible for any application while maintaining type safety.

## Quick Start

### Option 1: Use Default Events (Backwards Compatible)
```typescript
import { useEventManager } from 'foc-engine-js';

// Uses the original POW app event types + string
const eventManager = useEventManager();
eventManager.notify("TxAdded", { txHash: "0x123..." });
```

### Option 2: Create Custom Typed Event Manager
```typescript
import { createCustomEventManager } from 'foc-engine-js';

// Define your app's events
type MyAppEvents = 
  | "UserLogin"
  | "UserLogout"
  | "PaymentProcessed"
  | "DataSynced";

// Create typed event manager
const useMyAppEvents = createCustomEventManager<MyAppEvents>();

// Use it in your app
const eventManager = useMyAppEvents();
eventManager.notify("UserLogin", { userId: 123 }); // ✅ Type-safe!
// eventManager.notify("InvalidEvent", {}); // ❌ TypeScript error!
```

### Option 3: Use Predefined Common Events
```typescript
import { createCustomEventManager, CommonWebEvents } from 'foc-engine-js';

const useWebAppEvents = createCustomEventManager<CommonWebEvents>();
```

## Advanced Usage

### Event Configuration with Metadata
```typescript
import { EventConfig, EventNamesFromConfig } from 'foc-engine-js';

const EVENT_CONFIGS = [
  { 
    name: "UserLogin", 
    description: "User authentication success",
    category: "auth",
    priority: "medium" as const
  },
  { 
    name: "PaymentFailed", 
    description: "Payment processing error",
    category: "transaction",
    priority: "high" as const
  },
] as const;

type MyEvents = EventNamesFromConfig<typeof EVENT_CONFIGS>;
const useTypedEvents = createCustomEventManager<MyEvents>();
```

### Custom Observers with Typed Events
```typescript
import { Observer } from 'foc-engine-js';

class MyAppNotificationObserver implements Observer<MyAppEvents> {
  async onNotify(eventName: MyAppEvents, data?: any): Promise<void> {
    switch (eventName) {
      case "UserLogin":
        this.showWelcomeNotification(data.username);
        break;
      case "PaymentProcessed":
        this.showPaymentSuccess(data.amount);
        break;
      // TypeScript ensures all events are handled!
    }
  }
}
```

### React Hook Integration
```typescript
import { useEffect } from 'react';

function useAppEventHandlers() {
  const { notify, registerObserver, unregisterObserver } = useMyAppEvents();

  useEffect(() => {
    const observer = new MyAppNotificationObserver();
    const observerId = registerObserver(observer);
    
    return () => unregisterObserver(observerId);
  }, [registerObserver, unregisterObserver]);

  return {
    onUserLogin: (user: User) => notify("UserLogin", { username: user.name }),
    onPaymentComplete: (amount: number) => notify("PaymentProcessed", { amount }),
  };
}
```

## Predefined Event Types

The package includes several predefined event type collections:

### UIEvents
- ButtonClick, FormSubmit, ModalOpen, ModalClose, TabSwitch, NavClick

### TransactionEvents  
- TxInitiated, TxSigned, TxSubmitted, TxConfirmed, TxFailed, TxRejected

### WalletEvents
- WalletConnected, WalletDisconnected, AccountChanged, NetworkChanged, BalanceUpdated

### GameEvents
- GameStarted, GameEnded, ScoreUpdated, LevelCompleted, PowerUpUsed, ItemCollected

### NotificationEvents
- NotificationShown, NotificationDismissed, AlertTriggered, WarningShown, ErrorOccurred

### Combined Types
- `CommonWebEvents` = UIEvents + TransactionEvents + WalletEvents + NotificationEvents
- `CommonGameEvents` = GameEvents + UIEvents + TransactionEvents + NotificationEvents

## Migration Guide

### From Hard-coded Events
**Before:**
```typescript
// Events were fixed in the package
useEventManager().notify("TxAdded", data);
```

**After (Backwards Compatible):**
```typescript
// Still works exactly the same
useEventManager().notify("TxAdded", data);
```

**After (Recommended New Way):**
```typescript
// Define your own events for better maintainability
type MyEvents = "TransactionAdded" | "TransactionCompleted";
const useMyEvents = createCustomEventManager<MyEvents>();
useMyEvents().notify("TransactionAdded", data);
```

## Benefits

1. **Type Safety**: TypeScript prevents typos and ensures consistent event names
2. **Intellisense**: IDE autocomplete for all your event names
3. **Maintainability**: Clear event definitions in one place
4. **Flexibility**: Use predefined events or create completely custom ones
5. **Performance**: No runtime overhead - all type checking happens at compile time
6. **Backwards Compatibility**: Existing code continues to work unchanged

## Best Practices

1. **Define events as const unions** for better type inference
2. **Use descriptive event names** that clearly indicate what happened
3. **Group related events** using predefined types like `TransactionEvents`
4. **Document event payloads** with TypeScript interfaces
5. **Keep event granularity balanced** - not too specific, not too generic

```typescript
// Good
type AppEvents = 
  | "user.login.success"
  | "user.login.failed" 
  | "transaction.submitted"
  | "transaction.confirmed";

// Less ideal
type AppEvents = "event1" | "event2" | "something_happened";
```