import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

export type InAppNotificationType = {
  id: string;
  notificationTypeId: number;
  message: string;
};

export interface NotificationConfig {
  id: number;
  eventType?: string;
  message: string;
}

interface InAppNotificationsState {
  inAppNotifications: InAppNotificationType[];
  notificationConfigs: NotificationConfig[];
  notificationLimit: number;
  sendInAppNotification: (notificationTypeId: number, message?: string) => void;
  clearInAppNotification: (id: string) => void;
  setNotificationConfigs: (configs: NotificationConfig[]) => void;
  setNotificationLimit: (limit: number) => void;
}

export const useInAppNotificationsStore = create<InAppNotificationsState>(
  (set, get) => ({
    inAppNotifications: [],
    notificationConfigs: [],
    notificationLimit: 5,
    
    sendInAppNotification: (notificationTypeId: number, message?: string) => {
      set((state) => {
        const config = state.notificationConfigs.find(c => c.id === notificationTypeId);
        const notifMsg = message || 
          config?.message || 
          "Unknown notification type";
          
        const newNotification: InAppNotificationType = {
          id: uuidv4(),
          notificationTypeId,
          message: notifMsg,
        };
        
        if (state.inAppNotifications.length >= state.notificationLimit) {
          return {
            inAppNotifications: [
              ...state.inAppNotifications.slice(1),
              newNotification,
            ],
          };
        }
        
        return {
          inAppNotifications: [...state.inAppNotifications, newNotification],
        };
      });
    },
    
    clearInAppNotification: (id: string) => {
      set((state) => ({
        inAppNotifications: state.inAppNotifications.filter((n) => n.id !== id),
      }));
    },
    
    setNotificationConfigs: (configs: NotificationConfig[]) => {
      set({ notificationConfigs: configs });
    },
    
    setNotificationLimit: (limit: number) => {
      set({ notificationLimit: limit });
    },
  }),
);

export const useInAppNotifications = () => {
  const { 
    inAppNotifications, 
    sendInAppNotification, 
    clearInAppNotification,
    setNotificationConfigs,
    setNotificationLimit 
  } = useInAppNotificationsStore();
  
  return { 
    inAppNotifications, 
    sendInAppNotification, 
    clearInAppNotification,
    setNotificationConfigs,
    setNotificationLimit
  };
};