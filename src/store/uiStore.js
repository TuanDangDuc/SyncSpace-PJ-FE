import { create } from 'zustand'

export const useUiStore = create((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar:  () => set({ sidebarOpen: false }),
  openSidebar:   () => set({ sidebarOpen: true }),

  // Global modal
  modal: null, // { type, props }
  openModal:  (type, props = {}) => set({ modal: { type, props } }),
  closeModal: () => set({ modal: null }),
}))
