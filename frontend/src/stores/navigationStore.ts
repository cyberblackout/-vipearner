import { create } from 'zustand';

interface NavigationState {
  // Ephemeral page state preservation
  pageStates: Record<string, any>;
  setPageState: (pageKey: string, state: any) => void;
  getPageState: (pageKey: string) => any;
  clearPageState: (pageKey: string) => void;

  // Active modal dismiss handlers (LIFO stack for Android back button)
  modalStack: Array<{ id: string; dismiss: () => void }>;
  registerModal: (id: string, dismiss: () => void) => () => void;
  dismissTopModal: () => boolean;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  pageStates: {},

  setPageState: (pageKey, state) =>
    set((prev) => ({
      pageStates: {
        ...prev.pageStates,
        [pageKey]: {
          ...(prev.pageStates[pageKey] || {}),
          ...state,
        },
      },
    })),

  getPageState: (pageKey) => get().pageStates[pageKey] || null,

  clearPageState: (pageKey) =>
    set((prev) => {
      const next = { ...prev.pageStates };
      delete next[pageKey];
      return { pageStates: next };
    }),

  modalStack: [],

  registerModal: (id, dismiss) => {
    set((prev) => ({
      modalStack: [...prev.modalStack.filter((m) => m.id !== id), { id, dismiss }],
    }));

    // Return unregister cleanup function
    return () => {
      set((prev) => ({
        modalStack: prev.modalStack.filter((m) => m.id !== id),
      }));
    };
  },

  dismissTopModal: () => {
    const { modalStack } = get();
    if (modalStack.length > 0) {
      const top = modalStack[modalStack.length - 1];
      set({ modalStack: modalStack.slice(0, -1) });
      try {
        top.dismiss();
      } catch (_) {}
      return true;
    }
    return false;
  },
}));
