# InApp Notifications Store

The InApp Notifications Store provides a robust system for displaying temporary, contextual notifications within your application. It features configurable notification types, automatic queue management, and seamless integration with the event system.

## Features

- **Configurable Notification Types**: Define custom notification categories with messages and metadata
- **Queue Management**: Automatic notification queue with configurable limits and FIFO overflow handling
- **Event Integration**: Seamless integration with the EventManager for event-driven notifications
- **Message Templating**: Support for dynamic messages with fallbacks to configured defaults
- **Auto-Expiration**: Built-in support for timed notifications and manual dismissal
- **Type Safety**: Full TypeScript support with proper notification typing

## Quick Start

### Basic Usage
```typescript
import { useInAppNotifications } from 'foc-engine-js';

function NotificationDemo() {
  const {
    inAppNotifications,
    sendInAppNotification,
    clearInAppNotification,
    setNotificationConfigs,
    setNotificationLimit
  } = useInAppNotifications();

  // Configure notification types
  useEffect(() => {
    const notificationConfigs = [
      { id: 1, eventType: 'UserLogin', message: 'Welcome back! 👋' },
      { id: 2, eventType: 'TransactionSuccess', message: 'Transaction completed successfully! ✅' },
      { id: 3, eventType: 'Error', message: 'Something went wrong. Please try again. ❌' },
      { id: 4, eventType: 'Achievement', message: 'Achievement unlocked! 🏆' },
    ];
    
    setNotificationConfigs(notificationConfigs);
    setNotificationLimit(3); // Show max 3 notifications at once
  }, []);

  const showSuccessNotification = () => {
    sendInAppNotification(2); // Uses configured message
  };

  const showCustomNotification = () => {
    sendInAppNotification(1, 'Custom welcome message!'); // Override message
  };

  return (
    <div>
      <div className="notification-container">
        {inAppNotifications.map((notification) => (
          <div key={notification.id} className="notification">
            <span>{notification.message}</span>
            <button onClick={() => clearInAppNotification(notification.id)}>
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="demo-controls">
        <button onClick={showSuccessNotification}>
          Show Success Notification
        </button>
        <button onClick={showCustomNotification}>
          Show Custom Message
        </button>
      </div>
    </div>
  );
}
```

### Integration with EventManager
```typescript
import { useEventManager, useInAppNotifications } from 'foc-engine-js';

function EventDrivenNotifications() {
  const { notify } = useEventManager();
  const { setNotificationConfigs } = useInAppNotifications();

  useEffect(() => {
    // Configure notifications for events
    setNotificationConfigs([
      { id: 1, eventType: 'TxAdded', message: 'Transaction added to queue' },
      { id: 2, eventType: 'TxCompleted', message: 'Transaction completed!' },
      { id: 3, eventType: 'BuyFailed', message: 'Purchase failed - insufficient funds' },
      { id: 4, eventType: 'InvalidPurchase', message: 'Invalid purchase attempt' },
    ]);
  }, []);

  // Trigger events that will automatically show notifications
  const addTransaction = () => {
    notify('TxAdded', { txHash: '0x123...' });
  };

  const completePurchase = () => {
    notify('TxCompleted', { amount: 100 });
  };

  return (
    <div>
      <button onClick={addTransaction}>Add Transaction</button>
      <button onClick={completePurchase}>Complete Purchase</button>
    </div>
  );
}
```

## Core Concepts

### Notification Configuration
Define your notification types with structured configuration:

```typescript
interface NotificationConfig {
  id: number;           // Unique identifier for notification type
  eventType?: string;   // Optional event type for automatic triggering
  message: string;      // Default message template
  priority?: 'low' | 'medium' | 'high' | 'critical';
  category?: string;    // Grouping category
  duration?: number;    // Auto-dismiss duration in ms
  icon?: string;        // Icon identifier
  color?: string;       // Theme color
}

const notificationConfigs: NotificationConfig[] = [
  {
    id: 1,
    eventType: 'UserLogin',
    message: 'Welcome back, {username}!',
    priority: 'medium',
    category: 'auth',
    icon: 'user',
    color: 'success'
  },
  {
    id: 2,
    eventType: 'PaymentFailed',
    message: 'Payment failed: {reason}',
    priority: 'high',
    category: 'transaction',
    duration: 8000,
    icon: 'error',
    color: 'error'
  },
  {
    id: 3,
    eventType: 'Achievement',
    message: 'Achievement unlocked: {title}!',
    priority: 'medium',
    category: 'gamification',
    duration: 5000,
    icon: 'trophy',
    color: 'warning'
  }
];
```

### Queue Management
The notification system automatically manages a queue with overflow handling:

```typescript
// Configure queue behavior
setNotificationLimit(5); // Maximum 5 notifications visible

// When limit is exceeded, oldest notifications are removed (FIFO)
// New notification: [A, B, C, D, E] -> [B, C, D, E, NEW] (A removed)
```

## API Reference

### useInAppNotifications Hook
```typescript
const {
  // State
  inAppNotifications,        // InAppNotificationType[] - Current active notifications
  
  // Actions
  sendInAppNotification,     // (typeId: number, message?: string) => void
  clearInAppNotification,    // (id: string) => void
  
  // Configuration
  setNotificationConfigs,    // (configs: NotificationConfig[]) => void
  setNotificationLimit,      // (limit: number) => void
} = useInAppNotifications();
```

### Types
```typescript
interface InAppNotificationType {
  id: string;                // Unique notification instance ID
  notificationTypeId: number; // Configuration ID
  message: string;           // Display message
  timestamp?: number;        // Creation timestamp
  priority?: string;         // Priority level
}

interface NotificationConfig {
  id: number;               // Notification type ID
  eventType?: string;       // Associated event type
  message: string;          // Default message template
  priority?: string;        // Priority level
  category?: string;        // Category grouping
  duration?: number;        // Auto-dismiss duration
  [key: string]: any;       // Additional metadata
}
```

## Advanced Usage Patterns

### Notification Templates with Variables
```typescript
function TemplatedNotifications() {
  const { sendInAppNotification, setNotificationConfigs } = useInAppNotifications();

  useEffect(() => {
    setNotificationConfigs([
      {
        id: 1,
        message: 'Welcome back, {username}! You have {messageCount} new messages.',
        category: 'user'
      },
      {
        id: 2,
        message: 'Transfer of {amount} {token} to {recipient} completed!',
        category: 'transaction'
      }
    ]);
  }, []);

  const showWelcomeNotification = (userData: any) => {
    const message = `Welcome back, ${userData.username}! You have ${userData.messageCount} new messages.`;
    sendInAppNotification(1, message);
  };

  const showTransferNotification = (txData: any) => {
    const message = `Transfer of ${txData.amount} ${txData.token} to ${txData.recipient} completed!`;
    sendInAppNotification(2, message);
  };

  return (
    <div>
      <button onClick={() => showWelcomeNotification({ username: 'Alice', messageCount: 3 })}>
        Show Welcome
      </button>
      <button onClick={() => showTransferNotification({ amount: 100, token: 'ETH', recipient: '0x123...' })}>
        Show Transfer Complete
      </button>
    </div>
  );
}
```

### Priority-Based Notification System
```typescript
function PriorityNotificationSystem() {
  const [notifications, setNotifications] = useState<InAppNotificationType[]>([]);
  const { inAppNotifications, clearInAppNotification } = useInAppNotifications();

  useEffect(() => {
    // Sort notifications by priority
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const sortedNotifications = [...inAppNotifications].sort((a, b) => {
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 1;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 1;
      return bPriority - aPriority;
    });
    
    setNotifications(sortedNotifications);
  }, [inAppNotifications]);

  return (
    <div className="notification-stack">
      {notifications.map((notification, index) => (
        <div 
          key={notification.id}
          className={`notification priority-${notification.priority || 'medium'}`}
          style={{ 
            zIndex: 1000 - index,
            marginBottom: index * 60 + 'px'
          }}
        >
          <div className="notification-content">
            <span className="message">{notification.message}</span>
            <button onClick={() => clearInAppNotification(notification.id)}>
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Auto-Dismissing Notifications
```typescript
function AutoDismissNotifications() {
  const { inAppNotifications, clearInAppNotification, sendInAppNotification } = useInAppNotifications();
  const [timers, setTimers] = useState<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    // Setup auto-dismiss timers for new notifications
    inAppNotifications.forEach(notification => {
      if (!timers.has(notification.id)) {
        const duration = notification.duration || 5000; // Default 5 seconds
        
        const timer = setTimeout(() => {
          clearInAppNotification(notification.id);
          setTimers(prev => {
            const newTimers = new Map(prev);
            newTimers.delete(notification.id);
            return newTimers;
          });
        }, duration);

        setTimers(prev => new Map(prev).set(notification.id, timer));
      }
    });

    // Cleanup timers for removed notifications
    const currentIds = new Set(inAppNotifications.map(n => n.id));
    timers.forEach((timer, id) => {
      if (!currentIds.has(id)) {
        clearTimeout(timer);
        setTimers(prev => {
          const newTimers = new Map(prev);
          newTimers.delete(id);
          return newTimers;
        });
      }
    });

    return () => {
      // Cleanup all timers on unmount
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [inAppNotifications, timers, clearInAppNotification]);

  const showTimedNotification = (duration: number) => {
    // Send notification with custom duration
    const customMessage = `This notification will auto-dismiss in ${duration/1000} seconds`;
    sendInAppNotification(1, customMessage);
  };

  return (
    <div>
      <button onClick={() => showTimedNotification(3000)}>
        3 Second Notification
      </button>
      <button onClick={() => showTimedNotification(10000)}>
        10 Second Notification
      </button>
    </div>
  );
}
```

### Notification Categories and Filtering
```typescript
function CategorizedNotifications() {
  const { inAppNotifications, setNotificationConfigs } = useInAppNotifications();
  const [activeCategories, setActiveCategories] = useState<string[]>(['all']);

  const notificationConfigs = [
    { id: 1, message: 'Transaction confirmed', category: 'blockchain', eventType: 'TxConfirmed' },
    { id: 2, message: 'New message received', category: 'social', eventType: 'MessageReceived' },
    { id: 3, message: 'System update available', category: 'system', eventType: 'UpdateAvailable' },
    { id: 4, message: 'Achievement unlocked!', category: 'gamification', eventType: 'Achievement' },
  ];

  useEffect(() => {
    setNotificationConfigs(notificationConfigs);
  }, []);

  const filteredNotifications = inAppNotifications.filter(notification => {
    if (activeCategories.includes('all')) return true;
    
    const config = notificationConfigs.find(c => c.id === notification.notificationTypeId);
    return config && activeCategories.includes(config.category);
  });

  const toggleCategory = (category: string) => {
    setActiveCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev.filter(c => c !== 'all'), category]
    );
  };

  const categories = ['blockchain', 'social', 'system', 'gamification'];

  return (
    <div>
      <div className="category-filters">
        <button 
          onClick={() => setActiveCategories(['all'])}
          className={activeCategories.includes('all') ? 'active' : ''}
        >
          All
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => toggleCategory(category)}
            className={activeCategories.includes(category) ? 'active' : ''}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="filtered-notifications">
        {filteredNotifications.map(notification => (
          <div key={notification.id} className="notification">
            {notification.message}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Notification Analytics
```typescript
function useNotificationAnalytics() {
  const { inAppNotifications } = useInAppNotifications();
  const [analytics, setAnalytics] = useState({
    totalShown: 0,
    dismissed: 0,
    autoDismissed: 0,
    averageViewTime: 0,
    byCategory: {} as Record<string, number>,
    byType: {} as Record<number, number>
  });

  const trackNotificationShown = (notification: InAppNotificationType) => {
    setAnalytics(prev => ({
      ...prev,
      totalShown: prev.totalShown + 1,
      byType: {
        ...prev.byType,
        [notification.notificationTypeId]: (prev.byType[notification.notificationTypeId] || 0) + 1
      }
    }));
  };

  const trackNotificationDismissed = (notificationId: string, method: 'manual' | 'auto') => {
    setAnalytics(prev => ({
      ...prev,
      dismissed: method === 'manual' ? prev.dismissed + 1 : prev.dismissed,
      autoDismissed: method === 'auto' ? prev.autoDismissed + 1 : prev.autoDismissed
    }));
  };

  const getEngagementRate = () => {
    if (analytics.totalShown === 0) return 0;
    return (analytics.dismissed / analytics.totalShown) * 100;
  };

  const getMostUsedType = () => {
    const entries = Object.entries(analytics.byType);
    if (entries.length === 0) return null;
    
    return entries.reduce((max, current) => 
      current[1] > max[1] ? current : max
    )[0];
  };

  return {
    analytics,
    trackNotificationShown,
    trackNotificationDismissed,
    getEngagementRate,
    getMostUsedType,
  };
}

function NotificationAnalyticsDisplay() {
  const { analytics, getEngagementRate, getMostUsedType } = useNotificationAnalytics();

  return (
    <div className="notification-analytics">
      <h3>Notification Analytics</h3>
      <div className="stats">
        <div>Total Shown: {analytics.totalShown}</div>
        <div>Manually Dismissed: {analytics.dismissed}</div>
        <div>Auto Dismissed: {analytics.autoDismissed}</div>
        <div>Engagement Rate: {getEngagementRate().toFixed(1)}%</div>
        <div>Most Used Type: {getMostUsedType() || 'None'}</div>
      </div>
    </div>
  );
}
```

## Integration with Observer Pattern

The notifications work seamlessly with the Observer system for automatic event-driven notifications:

```typescript
import { InAppNotificationsObserver } from 'foc-engine-js';

function setupNotificationObserver() {
  const { sendInAppNotification, setNotificationConfigs } = useInAppNotifications();
  const eventManager = useEventManager();

  // Configure notifications
  useEffect(() => {
    setNotificationConfigs([
      { id: 1, eventType: 'BuyFailed', message: 'Purchase failed - please try again' },
      { id: 2, eventType: 'InvalidPurchase', message: 'Invalid purchase attempt' },
      { id: 3, eventType: 'BlockFull', message: 'Network is busy - transaction delayed' },
      { id: 4, eventType: 'TxAdded', message: 'Transaction added successfully' },
    ]);

    // Create and register observer
    const notificationObserver = new InAppNotificationsObserver(
      sendInAppNotification,
      notificationConfigs
    );

    const observerId = eventManager.registerObserver(notificationObserver);
    
    return () => eventManager.unregisterObserver(observerId);
  }, []);
}
```

## Styling and Theming

### CSS Classes for Styling
```css
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 400px;
}

.notification {
  background: var(--notification-bg, #333);
  color: var(--notification-text, white);
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transform: translateX(0);
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification.priority-critical {
  background: var(--color-error, #dc3545);
  border-left: 4px solid var(--color-error-dark, #c82333);
}

.notification.priority-high {
  background: var(--color-warning, #ffc107);
  color: var(--color-dark, #212529);
}

.notification.priority-medium {
  background: var(--color-info, #17a2b8);
}

.notification.priority-low {
  background: var(--color-secondary, #6c757d);
}

.notification.entering {
  transform: translateX(100%);
  opacity: 0;
}

.notification.exiting {
  transform: translateX(100%);
  opacity: 0;
}

.notification-dismiss {
  background: none;
  border: none;
  color: inherit;
  font-size: 18px;
  cursor: pointer;
  padding: 0 0 0 8px;
}
```

### Animated Notification Component
```typescript
function AnimatedNotification({ 
  notification, 
  onDismiss 
}: { 
  notification: InAppNotificationType;
  onDismiss: (id: string) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Wait for exit animation before removing
    setTimeout(() => onDismiss(notification.id), 300);
  };

  return (
    <div 
      className={`notification ${isVisible ? 'visible' : 'entering'}`}
      style={{
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <span className="message">{notification.message}</span>
      <button 
        className="notification-dismiss"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}
```

## Best Practices

### 1. Configuration Management
```typescript
// Centralize notification configurations
const NOTIFICATION_CONFIGS = {
  AUTH: [
    { id: 1, eventType: 'LoginSuccess', message: 'Welcome back!', priority: 'low' },
    { id: 2, eventType: 'LoginFailed', message: 'Login failed', priority: 'high' },
  ],
  TRANSACTIONS: [
    { id: 10, eventType: 'TxPending', message: 'Transaction pending...', priority: 'medium' },
    { id: 11, eventType: 'TxConfirmed', message: 'Transaction confirmed!', priority: 'medium' },
    { id: 12, eventType: 'TxFailed', message: 'Transaction failed', priority: 'high' },
  ]
};

const allConfigs = Object.values(NOTIFICATION_CONFIGS).flat();
```

### 2. Message Internationalization
```typescript
function useLocalizedNotifications() {
  const { sendInAppNotification, setNotificationConfigs } = useInAppNotifications();
  const { t } = useTranslation(); // Your i18n hook

  const sendLocalizedNotification = (typeId: number, variables?: Record<string, any>) => {
    const localizedMessage = t(`notifications.${typeId}`, variables);
    sendInAppNotification(typeId, localizedMessage);
  };

  return { sendLocalizedNotification };
}
```

### 3. Performance Optimization
```typescript
// Limit notification history for memory efficiency
useEffect(() => {
  const cleanup = setInterval(() => {
    // Keep only recent notifications in memory
    const cutoff = Date.now() - 60000; // 1 minute
    // Implementation depends on your needs
  }, 30000); // Cleanup every 30 seconds

  return () => clearInterval(cleanup);
}, []);
```

### 4. Accessibility
```typescript
function AccessibleNotifications() {
  const { inAppNotifications } = useInAppNotifications();
  
  useEffect(() => {
    // Announce new notifications to screen readers
    inAppNotifications.forEach(notification => {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = `Notification: ${notification.message}`;
      
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    });
  }, [inAppNotifications]);

  return null;
}
```

This InApp Notifications system provides a flexible, powerful way to communicate with users while maintaining a clean, manageable notification experience.