# Observer Pattern System

The Observer Pattern System provides a flexible, type-safe event-driven architecture that enables loose coupling between different parts of your application. It allows components to subscribe to and respond to events without knowing about each other directly.

## Features

- **Type-Safe Events**: Generic event types with full TypeScript support
- **Decoupled Architecture**: Components communicate through events without direct dependencies
- **Dynamic Registration**: Runtime observer registration and unregistration
- **Event Data Passing**: Rich event data can be passed to observers
- **Built-in Observers**: Pre-built observers for common use cases (notifications, sound effects)
- **Configurable Behavior**: Observers can be configured for different response patterns
- **Error Isolation**: Observer failures don't affect other observers or the event system

## Quick Start

### Basic Usage
```typescript
import { createEventManager, useEventManager } from 'foc-engine-js';

// Define your event types
type GameEvents = 
  | 'PlayerJump'
  | 'EnemyDefeated' 
  | 'LevelComplete'
  | 'ScoreChanged';

// Create a typed event manager
const useGameEvents = createEventManager<GameEvents>();

function GameComponent() {
  const { notify, registerObserver, unregisterObserver } = useGameEvents();

  // Create a simple observer
  const scoreObserver = {
    async onNotify(eventName: GameEvents, data?: any) {
      if (eventName === 'ScoreChanged') {
        console.log('Score updated:', data.newScore);
      }
    }
  };

  useEffect(() => {
    const observerId = registerObserver(scoreObserver);
    return () => unregisterObserver(observerId);
  }, []);

  const handlePlayerJump = () => {
    notify('PlayerJump', { timestamp: Date.now() });
  };

  return (
    <button onClick={handlePlayerJump}>
      Jump!
    </button>
  );
}
```

### Using Built-in Observers
```typescript
import { 
  SoundObserver, 
  InAppNotificationsObserver,
  useSound,
  useInAppNotifications,
  useEventManager
} from 'foc-engine-js';

function GameWithObservers() {
  const { notify, registerObserver } = useEventManager();
  const { playSound } = useSound();
  const { sendInAppNotification, setNotificationConfigs } = useInAppNotifications();

  useEffect(() => {
    // Configure notifications
    setNotificationConfigs([
      { id: 1, eventType: 'LevelComplete', message: 'Level completed! 🎉' },
      { id: 2, eventType: 'PlayerDied', message: 'Game Over! Try again.' },
    ]);

    // Create and register sound observer
    const soundObserver = new SoundObserver(playSound, {
      enablePitchVariation: true,
      maxBlockFullAttempts: 3
    });

    // Create and register notification observer  
    const notificationObserver = new InAppNotificationsObserver(
      sendInAppNotification,
      notificationConfigs
    );

    // Register observers
    const soundObserverId = registerObserver(soundObserver);
    const notificationObserverId = registerObserver(notificationObserver);

    return () => {
      unregisterObserver(soundObserverId);
      unregisterObserver(notificationObserverId);
    };
  }, []);

  const completeLevel = () => {
    notify('LevelComplete', { level: 5, score: 1000 });
  };

  return (
    <button onClick={completeLevel}>
      Complete Level
    </button>
  );
}
```

## Core Concepts

### Observer Interface
The foundation of the pattern is the `Observer` interface:

```typescript
interface Observer<TEventType = string> {
  onNotify(eventName: TEventType, data?: any): Promise<void>;
}
```

All observers must implement this interface, making them interchangeable and testable.

### Event Manager
The Event Manager coordinates between event emitters and observers:

```typescript
type EventManager<TEventType = string> = {
  observers: Map<string, Observer<TEventType>>;
  registerObserver(observer: Observer<TEventType>): string;
  unregisterObserver(observerId: string): void;
  notify(eventType: TEventType, data?: any): void;
};
```

### Generic Event Types
Create type-safe event systems for any domain:

```typescript
// E-commerce events
type ECommerceEvents = 
  | 'ProductAdded'
  | 'CartUpdated'
  | 'OrderPlaced'
  | 'PaymentProcessed';

const useECommerceEvents = createEventManager<ECommerceEvents>();

// Social media events
type SocialEvents = 
  | 'PostLiked'
  | 'UserFollowed'
  | 'MessageSent'
  | 'NotificationReceived';

const useSocialEvents = createEventManager<SocialEvents>();
```

## API Reference

### createEventManager<TEventType>()
Factory function that creates a typed event manager hook:

```typescript
const useTypedEvents = createEventManager<YourEventTypes>();

// Returns a Zustand hook with the following interface:
const {
  observers,           // Map<string, Observer<TEventType>>
  registerObserver,    // (observer: Observer<TEventType>) => string
  unregisterObserver,  // (observerId: string) => void
  notify              // (eventType: TEventType, data?: any) => void
} = useTypedEvents();
```

### Observer Methods

#### registerObserver(observer)
Registers an observer to receive event notifications:

```typescript
const myObserver = {
  async onNotify(eventName, data) {
    console.log('Event received:', eventName, data);
  }
};

const observerId = registerObserver(myObserver);
// Returns: string - unique observer ID for later removal
```

#### unregisterObserver(observerId)
Removes an observer from the system:

```typescript
unregisterObserver(observerId);
// Observer will no longer receive events
```

#### notify(eventType, data?)
Triggers an event that will be sent to all registered observers:

```typescript
notify('UserLogin', { 
  userId: '123', 
  timestamp: Date.now(),
  provider: 'google'
});
// All observers will receive this event
```

## Built-in Observers

### SoundObserver
Handles audio feedback based on events with intelligent pitch shifting:

```typescript
import { SoundObserver } from 'foc-engine-js';

const soundObserver = new SoundObserver(playSound, {
  enablePitchVariation: true,     // Enable dynamic pitch shifting
  maxBlockFullAttempts: 3         // Max attempts before playing BlockFull sound
});

// Automatic pitch shifting for progression-based events
notify('MineClicked', { 
  counter: 7, 
  difficulty: 10  // 70% progress = higher pitch
});

// Transaction-based pitch shifting
notify('TxAdded', { 
  progress: 0.8,    // Block progress
  tx: { fee: 12345 } // Fee affects pitch
});
```

#### SoundObserver Event Handling
- **TxAdded**: Pitch varies based on block progress and transaction fee
- **MineClicked**: Pitch increases with mining progress  
- **BlockFull**: Plays after configured number of attempts
- **ItemPurchased/UpgradePurchased**: Resets BlockFull counter
- **Other events**: Play at normal pitch

### InAppNotificationsObserver
Manages contextual notifications with smart filtering:

```typescript
import { InAppNotificationsObserver } from 'foc-engine-js';

const notificationObserver = new InAppNotificationsObserver(
  sendInAppNotification,
  notificationConfigs
);

notificationObserver.setMaxBlockFullAttempts(5); // Configure BlockFull behavior
```

#### InAppNotificationsObserver Event Handling
- **BuyFailed/InvalidPurchase**: Immediately shows error notification
- **BlockFull**: Shows notification only after max attempts reached
- **TxAdded/ItemPurchased**: Resets BlockFull attempt counter
- **Other events**: Shows notification with optional custom message

## Advanced Usage Patterns

### Custom Observer Classes
```typescript
class AnalyticsObserver<TEventType extends string> implements Observer<TEventType> {
  private analytics: AnalyticsService;

  constructor(analyticsService: AnalyticsService) {
    this.analytics = analyticsService;
  }

  async onNotify(eventName: TEventType, data?: any): Promise<void> {
    // Track all events for analytics
    await this.analytics.track(eventName, {
      timestamp: Date.now(),
      ...data
    });

    // Special handling for conversion events
    const conversionEvents = ['PurchaseCompleted', 'SignupCompleted'];
    if (conversionEvents.includes(eventName as string)) {
      await this.analytics.trackConversion(eventName, data);
    }
  }
}

// Usage
const analyticsObserver = new AnalyticsObserver(analyticsService);
const observerId = registerObserver(analyticsObserver);
```

### State Management Observer
```typescript
class StateObserver<TEventType extends string> implements Observer<TEventType> {
  private setState: (update: any) => void;

  constructor(setState: (update: any) => void) {
    this.setState = setState;
  }

  async onNotify(eventName: TEventType, data?: any): Promise<void> {
    switch (eventName) {
      case 'UserLogin':
        this.setState({ isLoggedIn: true, user: data.user });
        break;
      case 'UserLogout':
        this.setState({ isLoggedIn: false, user: null });
        break;
      case 'ScoreChanged':
        this.setState(prev => ({ score: prev.score + data.delta }));
        break;
    }
  }
}
```

### Conditional Observer
```typescript
class ConditionalObserver<TEventType extends string> implements Observer<TEventType> {
  private condition: () => boolean;
  private target: Observer<TEventType>;

  constructor(condition: () => boolean, target: Observer<TEventType>) {
    this.condition = condition;
    this.target = target;
  }

  async onNotify(eventName: TEventType, data?: any): Promise<void> {
    if (this.condition()) {
      await this.target.onNotify(eventName, data);
    }
  }
}

// Usage - only notify during gameplay
const gameplayCondition = () => gameState.currentScreen === 'gameplay';
const conditionalSound = new ConditionalObserver(gameplayCondition, soundObserver);
```

### Filtering Observer
```typescript
class FilteringObserver<TEventType extends string> implements Observer<TEventType> {
  private eventFilter: Set<TEventType>;
  private target: Observer<TEventType>;

  constructor(allowedEvents: TEventType[], target: Observer<TEventType>) {
    this.eventFilter = new Set(allowedEvents);
    this.target = target;
  }

  async onNotify(eventName: TEventType, data?: any): Promise<void> {
    if (this.eventFilter.has(eventName)) {
      await this.target.onNotify(eventName, data);
    }
  }
}

// Usage - only forward specific events
const criticalEvents = ['Error', 'Warning', 'SystemFailure'];
const criticalObserver = new FilteringObserver(criticalEvents, alertObserver);
```

### Batching Observer
```typescript
class BatchingObserver<TEventType extends string> implements Observer<TEventType> {
  private batchSize: number;
  private batchTimeout: number;
  private batch: Array<{ eventName: TEventType; data: any; timestamp: number }> = [];
  private timer: NodeJS.Timeout | null = null;
  private processor: (batch: any[]) => Promise<void>;

  constructor(
    batchSize: number = 10,
    batchTimeout: number = 5000,
    processor: (batch: any[]) => Promise<void>
  ) {
    this.batchSize = batchSize;
    this.batchTimeout = batchTimeout;
    this.processor = processor;
  }

  async onNotify(eventName: TEventType, data?: any): Promise<void> {
    this.batch.push({
      eventName,
      data,
      timestamp: Date.now()
    });

    // Process immediately if batch is full
    if (this.batch.length >= this.batchSize) {
      await this.processBatch();
    } 
    // Otherwise set/reset timer
    else if (!this.timer) {
      this.timer = setTimeout(() => this.processBatch(), this.batchTimeout);
    }
  }

  private async processBatch(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.batch.length > 0) {
      const batchToProcess = [...this.batch];
      this.batch = [];
      await this.processor(batchToProcess);
    }
  }
}

// Usage - batch analytics events
const batchProcessor = async (events: any[]) => {
  await analyticsAPI.sendBatch(events);
};
const batchingObserver = new BatchingObserver(5, 3000, batchProcessor);
```

### Throttling Observer
```typescript
class ThrottlingObserver<TEventType extends string> implements Observer<TEventType> {
  private throttleMs: number;
  private lastNotification = new Map<TEventType, number>();
  private target: Observer<TEventType>;

  constructor(throttleMs: number, target: Observer<TEventType>) {
    this.throttleMs = throttleMs;
    this.target = target;
  }

  async onNotify(eventName: TEventType, data?: any): Promise<void> {
    const now = Date.now();
    const lastTime = this.lastNotification.get(eventName) || 0;

    if (now - lastTime >= this.throttleMs) {
      this.lastNotification.set(eventName, now);
      await this.target.onNotify(eventName, data);
    }
  }
}

// Usage - prevent spam notifications
const throttledNotifications = new ThrottlingObserver(1000, notificationObserver);
```

## React Integration Patterns

### Custom Observer Hook
```typescript
function useCustomObserver<TEventType extends string>(
  eventManager: any,
  observerFactory: () => Observer<TEventType>,
  dependencies: any[] = []
) {
  useEffect(() => {
    const observer = observerFactory();
    const observerId = eventManager.registerObserver(observer);
    
    return () => {
      eventManager.unregisterObserver(observerId);
    };
  }, dependencies);
}

// Usage
function GameComponent() {
  const gameEvents = useGameEvents();
  
  useCustomObserver(
    gameEvents,
    () => new ScoreObserver(updateScore),
    [updateScore]
  );

  // Component logic...
}
```

### Multi-Observer Hook
```typescript
function useMultipleObservers<TEventType extends string>(
  eventManager: any,
  observers: Array<() => Observer<TEventType>>,
  dependencies: any[] = []
) {
  useEffect(() => {
    const observerIds = observers.map(factory => {
      const observer = factory();
      return eventManager.registerObserver(observer);
    });
    
    return () => {
      observerIds.forEach(id => eventManager.unregisterObserver(id));
    };
  }, dependencies);
}

// Usage
function ComplexComponent() {
  const events = useEventManager();

  useMultipleObservers(
    events,
    [
      () => new SoundObserver(playSound),
      () => new NotificationObserver(showNotification),
      () => new AnalyticsObserver(analytics),
    ],
    [playSound, showNotification, analytics]
  );
}
```

### Observer Component Pattern
```typescript
interface ObserverComponentProps<TEventType extends string> {
  eventManager: any;
  observer: Observer<TEventType>;
  children?: React.ReactNode;
}

function ObserverComponent<TEventType extends string>({ 
  eventManager, 
  observer, 
  children 
}: ObserverComponentProps<TEventType>) {
  useEffect(() => {
    const observerId = eventManager.registerObserver(observer);
    return () => eventManager.unregisterObserver(observerId);
  }, [eventManager, observer]);

  return <>{children}</>;
}

// Usage
function App() {
  const events = useEventManager();

  return (
    <div>
      <ObserverComponent 
        eventManager={events}
        observer={new SoundObserver(playSound)}
      >
        <GameScreen />
      </ObserverComponent>
      
      <ObserverComponent
        eventManager={events}
        observer={new AnalyticsObserver(analytics)}
      />
    </div>
  );
}
```

## Testing Observer Systems

### Mock Observer
```typescript
class MockObserver<TEventType extends string> implements Observer<TEventType> {
  public receivedEvents: Array<{ eventName: TEventType; data: any }> = [];

  async onNotify(eventName: TEventType, data?: any): Promise<void> {
    this.receivedEvents.push({ eventName, data });
  }

  getLastEvent() {
    return this.receivedEvents[this.receivedEvents.length - 1];
  }

  hasReceivedEvent(eventName: TEventType): boolean {
    return this.receivedEvents.some(event => event.eventName === eventName);
  }

  clear() {
    this.receivedEvents = [];
  }
}

// Test usage
describe('Event System', () => {
  it('should notify observers of events', async () => {
    const mockObserver = new MockObserver();
    const eventManager = createEventManager();
    
    const observerId = eventManager.getState().registerObserver(mockObserver);
    
    eventManager.getState().notify('TestEvent', { data: 'test' });
    
    await new Promise(resolve => setTimeout(resolve, 0)); // Allow async processing
    
    expect(mockObserver.hasReceivedEvent('TestEvent')).toBe(true);
    expect(mockObserver.getLastEvent().data).toEqual({ data: 'test' });
    
    eventManager.getState().unregisterObserver(observerId);
  });
});
```

### Testing Built-in Observers
```typescript
describe('SoundObserver', () => {
  it('should play sound with correct pitch for mining events', async () => {
    const mockPlaySound = jest.fn();
    const soundObserver = new SoundObserver(mockPlaySound, {
      enablePitchVariation: true
    });

    await soundObserver.onNotify('MineClicked', {
      counter: 8,
      difficulty: 10
    });

    expect(mockPlaySound).toHaveBeenCalledWith('MineClicked', 1.05); // 80% progress + 0.25
  });

  it('should reset BlockFull attempts on successful purchases', async () => {
    const mockPlaySound = jest.fn();
    const soundObserver = new SoundObserver(mockPlaySound);

    // Trigger BlockFull events to increase counter
    await soundObserver.onNotify('BlockFull');
    await soundObserver.onNotify('BlockFull');

    // Purchase should reset counter
    await soundObserver.onNotify('ItemPurchased');

    // Next BlockFull should not trigger sound yet
    await soundObserver.onNotify('BlockFull');
    
    expect(mockPlaySound).toHaveBeenCalledTimes(1); // Only ItemPurchased
  });
});
```

## Performance Considerations

### Memory Management
```typescript
class ManagedEventSystem<TEventType extends string> {
  private eventManager: any;
  private observerIds: string[] = [];

  constructor(eventManager: any) {
    this.eventManager = eventManager;
  }

  addObserver(observer: Observer<TEventType>): void {
    const id = this.eventManager.registerObserver(observer);
    this.observerIds.push(id);
  }

  cleanup(): void {
    this.observerIds.forEach(id => {
      this.eventManager.unregisterObserver(id);
    });
    this.observerIds = [];
  }
}

// Usage in React
function Component() {
  const eventSystem = useRef(new ManagedEventSystem(useEventManager()));

  useEffect(() => {
    const system = eventSystem.current;
    
    system.addObserver(soundObserver);
    system.addObserver(notificationObserver);
    
    return () => system.cleanup();
  }, []);
}
```

### Event Filtering for Performance
```typescript
class PerformantEventManager<TEventType extends string> {
  private observers = new Map<TEventType, Set<Observer<TEventType>>>();

  registerObserver(observer: Observer<TEventType>, events: TEventType[]): string {
    const id = uuidv4();
    
    events.forEach(eventType => {
      if (!this.observers.has(eventType)) {
        this.observers.set(eventType, new Set());
      }
      this.observers.get(eventType)!.add(observer);
    });

    return id;
  }

  notify(eventType: TEventType, data?: any): void {
    const observers = this.observers.get(eventType);
    if (observers) {
      observers.forEach(observer => {
        observer.onNotify(eventType, data);
      });
    }
  }
}
```

## Best Practices

### 1. Event Naming
```typescript
// Good - descriptive, consistent naming
type UserEvents = 
  | 'UserRegistered'
  | 'UserLoggedIn'
  | 'UserLoggedOut'
  | 'UserProfileUpdated';

// Avoid - generic or unclear names
type BadEvents = 
  | 'Event1'
  | 'Thing'
  | 'Update';
```

### 2. Error Handling
```typescript
class RobustObserver<TEventType extends string> implements Observer<TEventType> {
  async onNotify(eventName: TEventType, data?: any): Promise<void> {
    try {
      await this.processEvent(eventName, data);
    } catch (error) {
      console.error(`Observer error for event ${eventName}:`, error);
      // Don't re-throw to avoid breaking other observers
    }
  }

  private async processEvent(eventName: TEventType, data?: any): Promise<void> {
    // Implementation
  }
}
```

### 3. Resource Cleanup
```typescript
// Always clean up observers
useEffect(() => {
  const observerId = registerObserver(myObserver);
  return () => unregisterObserver(observerId);
}, []);
```

### 4. Type Safety
```typescript
// Define events with specific data shapes
interface EventData {
  UserRegistered: { userId: string; email: string; timestamp: number };
  ScoreChanged: { oldScore: number; newScore: number; delta: number };
  LevelCompleted: { level: number; duration: number; perfect: boolean };
}

type GameEvent = keyof EventData;

// Type-safe event notification
function notifyTyped<T extends GameEvent>(
  eventType: T, 
  data: EventData[T]
): void {
  notify(eventType, data);
}
```

The Observer Pattern System provides a powerful, flexible foundation for building event-driven applications with clean separation of concerns and excellent testability.