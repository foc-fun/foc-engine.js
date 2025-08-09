import { create } from "zustand";
import { Call } from "starknet";

interface OnchainActionsState {
  actions: Call[];
  maxActions: number;
  addAction: (action: Call) => void;
  clearActions: () => void;
  getActions: () => Call[];
  setMaxActions: (max: number) => void;
  invokeActions?: (actions: Call[]) => Promise<void>;
  onInvokeActions: (invokeActions: (actions: Call[]) => Promise<void>) => void;
}

export const useOnchainActions = create<OnchainActionsState>((set, get) => ({
  actions: [],
  maxActions: 50,
  
  addAction: (action: Call) =>
    set((state) => {
      const updatedActions = [...state.actions, action];
      
      if (updatedActions.length >= state.maxActions) {
        const toInvoke = updatedActions.slice(0, state.maxActions);
        const remaining = updatedActions.slice(state.maxActions);
        
        if (state.invokeActions) {
          state.invokeActions(toInvoke).catch(error => {
            console.error("Error invoking actions:", error);
          });
        }
        
        return { actions: remaining };
      }
      
      return { actions: updatedActions };
    }),
  
  clearActions: () => set({ actions: [] }),
  
  getActions: () => get().actions,
  
  setMaxActions: (max: number) => set({ maxActions: max }),
  
  invokeActions: undefined,
  
  onInvokeActions: (invokeActions) => set({ invokeActions }),
}));