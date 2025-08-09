import { Observer, EventType } from "../stores/useEventManager";
import { NotificationConfig } from "../stores/useInAppNotificationsStore";

export class InAppNotificationsObserver<TEventType extends string = EventType> implements Observer<TEventType> {
  private sendNotification: (notificationTypeId: number, message?: string) => void;
  private notificationConfigs: NotificationConfig[];
  private blockFullAttempts: number = 0;
  private maxBlockFullAttempts: number = 3;

  constructor(
    sendNotification: (notificationTypeId: number, message?: string) => void,
    notificationConfigs: NotificationConfig[] = []
  ) {
    this.sendNotification = sendNotification;
    this.notificationConfigs = notificationConfigs;
  }

  setNotificationConfigs(configs: NotificationConfig[]): void {
    this.notificationConfigs = configs;
  }

  setMaxBlockFullAttempts(max: number): void {
    this.maxBlockFullAttempts = max;
  }

  async onNotify(eventName: TEventType, data?: any): Promise<void> {
    const config = this.notificationConfigs.find(
      (notification) => notification.eventType === eventName
    );

    switch (eventName) {
      case "BuyFailed":
      case "InvalidPurchase": {
        if (config?.id !== undefined) {
          this.sendNotification(config.id);
        }
        break;
      }
      
      case "BlockFull": {
        this.blockFullAttempts++;
        if (this.blockFullAttempts >= this.maxBlockFullAttempts) {
          if (config?.id !== undefined) {
            this.sendNotification(config.id);
          }
          this.blockFullAttempts = 0;
        }
        break;
      }
      
      case "TxAdded":
      case "ItemPurchased":
      case "UpgradePurchased":
      case "AutomationPurchased": {
        this.blockFullAttempts = 0;
        break;
      }
      
      default: {
        if (config?.id !== undefined) {
          const message = data?.message || undefined;
          this.sendNotification(config.id, message);
        }
        break;
      }
    }
  }
}