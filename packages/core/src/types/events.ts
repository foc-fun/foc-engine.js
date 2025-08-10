// Common event patterns that apps might want to use

export type UIEvents = 
  | "ButtonClick"
  | "FormSubmit" 
  | "ModalOpen"
  | "ModalClose"
  | "TabSwitch"
  | "NavClick";

export type TransactionEvents = 
  | "TxInitiated"
  | "TxSigned" 
  | "TxSubmitted"
  | "TxConfirmed"
  | "TxFailed"
  | "TxRejected";

export type WalletEvents = 
  | "WalletConnected"
  | "WalletDisconnected" 
  | "AccountChanged"
  | "NetworkChanged"
  | "BalanceUpdated";

export type GameEvents = 
  | "GameStarted"
  | "GameEnded"
  | "ScoreUpdated" 
  | "LevelCompleted"
  | "PowerUpUsed"
  | "ItemCollected";

export type NotificationEvents = 
  | "NotificationShown"
  | "NotificationDismissed"
  | "AlertTriggered"
  | "WarningShown"
  | "ErrorOccurred";

// Common combined event types for different app types
export type CommonWebEvents = UIEvents | TransactionEvents | WalletEvents | NotificationEvents;
export type CommonGameEvents = GameEvents | UIEvents | TransactionEvents | NotificationEvents;

// Event configuration interface for apps to define their events
export interface EventConfig<TEventType extends string = string> {
  name: TEventType;
  description?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

// Helper type to extract event names from configurations
export type EventNamesFromConfig<T extends readonly EventConfig[]> = T[number]['name'];