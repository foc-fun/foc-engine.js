// Examples of how to use the configurable EventManager

import { createCustomEventManager, Observer } from '@foc-engine/core';
import { CommonWebEvents, EventConfig, EventNamesFromConfig } from '@foc-engine/core';

// Example 1: Using predefined common event types
export const useWebAppEventManager = createCustomEventManager<CommonWebEvents>();

// Example 2: Define custom events for your specific app
type MyAppEvents = 
  | "UserLogin"
  | "UserLogout" 
  | "DataSync"
  | "SettingsChanged"
  | "ThemeToggled";

export const useMyAppEventManager = createCustomEventManager<MyAppEvents>();

// Example 3: Using event configurations for more complex scenarios
const MY_APP_EVENT_CONFIGS = [
  { name: "UserLogin", description: "User successfully logged in", category: "auth", priority: "medium" },
  { name: "UserLogout", description: "User logged out", category: "auth", priority: "low" },
  { name: "PaymentProcessed", description: "Payment completed", category: "transaction", priority: "high" },
  { name: "DataCorrupted", description: "Critical data error", category: "system", priority: "critical" },
] as const;

type MyConfigBasedEvents = EventNamesFromConfig<typeof MY_APP_EVENT_CONFIGS>;
export const useConfigBasedEventManager = createCustomEventManager<MyConfigBasedEvents>();

// Example 4: Creating observers for custom events
export class MyAppNotificationObserver implements Observer<MyAppEvents> {
  async onNotify(eventName: MyAppEvents, data?: any): Promise<void> {
    switch (eventName) {
      case "UserLogin":
        console.log(`Welcome back, ${data?.username}!`);
        break;
      case "UserLogout":
        console.log("Goodbye!");
        break;
      case "DataSync":
        console.log(`Synced ${data?.recordCount} records`);
        break;
      case "SettingsChanged":
        console.log(`Settings updated: ${JSON.stringify(data?.changes)}`);
        break;
      case "ThemeToggled":
        console.log(`Theme changed to: ${data?.theme}`);
        break;
    }
  }
}

// Example 5: Using the event manager in a React component
export function useMyAppEvents() {
  const { notify, registerObserver, unregisterObserver } = useMyAppEventManager();

  const loginUser = (username: string) => {
    // Do login logic...
    notify("UserLogin", { username });
  };

  const syncData = (records: any[]) => {
    // Do sync logic...
    notify("DataSync", { recordCount: records.length });
  };

  return {
    loginUser,
    syncData,
    registerObserver,
    unregisterObserver,
  };
}