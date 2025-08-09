import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

// Generic event manager that works with any event type
export interface Observer<TEventType = string> {
  onNotify(eventName: TEventType, data?: any): Promise<void>;
}

export type EventManager<TEventType = string> = {
  observers: Map<string, Observer<TEventType>>;
  registerObserver(observer: Observer<TEventType>): string;
  unregisterObserver(observerId: string): void;
  notify(eventType: TEventType, data?: any): void;
};

// Default event types from POW app (for backwards compatibility)
export type DefaultEventTypes =
  | "BasicClick"
  | "BasicError"
  | "DiceRoll"
  | "MineClicked"
  | "MineDone"
  | "SequenceClicked"
  | "SequenceDone"
  | "ProveClicked"
  | "ProveDone"
  | "DaClicked"
  | "DaDone"
  | "BalanceUpdated"
  | "ItemPurchased"
  | "BuyFailed"
  | "InvalidPurchase"
  | "BlockFull"
  | "TxUpgradePurchased"
  | "UpgradePurchased"
  | "AutomationPurchased"
  | "DappsPurchased"
  | "StakingPurchased"
  | "L2Purchased"
  | "PrestigePurchased"
  | "TxAdded"
  | "AchievementCompleted"
  | "TutorialDismissed"
  | "SwitchStore"
  | "SwitchPage"
  | "SwitchTxTab";

// For backwards compatibility
export type EventType = DefaultEventTypes | string;

// Factory function to create a typed event manager
export function createEventManager<TEventType = string>() {
  return create<EventManager<TEventType>>((set, get) => ({
    observers: new Map<string, Observer<TEventType>>(),
    
    registerObserver(observer: Observer<TEventType>): string {
      const observerId = uuidv4();
      set((state) => ({
        observers: new Map(state.observers).set(observerId, observer),
      }));
      return observerId;
    },
    
    unregisterObserver(observerId: string): void {
      set((state) => {
        const newObservers = new Map(state.observers);
        newObservers.delete(observerId);
        return { observers: newObservers };
      });
    },
    
    notify(eventType: TEventType, data?: any): void {
      get().observers.forEach((observer, _) => {
        observer.onNotify(eventType, data);
      });
    },
  }));
}

// Default event manager with POW event types (for backwards compatibility)
export const useEventManager = createEventManager<EventType>();

// Helper function to create custom event managers with user-defined types
export function createCustomEventManager<TEventType extends string>() {
  return createEventManager<TEventType>();
}