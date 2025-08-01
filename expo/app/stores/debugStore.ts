// import { create } from "zustand"
import { createPersistedStore } from '@/utils/storage'

export enum DebugMode {
  OFF = "off",
  BASIC = "basic",
  VERBOSE = "verbose",
}

interface DebugState {
  debugMode: DebugMode
}

interface DebugActions {
  setDebugMode: (mode: DebugMode) => void
  toggleDebugMode: () => void
  isDebugEnabled: () => boolean
}

// Persisted store
export const useDebugStore = createPersistedStore<DebugState, DebugActions>(
  'debug-store',
  { debugMode: DebugMode.OFF },
  (set, get) => ({
    setDebugMode: (mode: DebugMode) => {
      set({ debugMode: mode })
    },
    
    toggleDebugMode: () => {
      const currentMode = get().debugMode
      const modes = Object.values(DebugMode)
      const currentIndex = modes.indexOf(currentMode)
      const nextIndex = (currentIndex + 1) % modes.length
      set({ debugMode: modes[nextIndex] })
    },
    
    isDebugEnabled: () => {
      return get().debugMode !== DebugMode.OFF
    },
  })
) 

/* 
// Not persisted
export const useDebugStore = create<DebugState>()(
  (set, get) => ({
    debugMode: DebugMode.OFF,
    
    setDebugMode: (mode: DebugMode) => {
      set({ debugMode: mode })
    },
    
    toggleDebugMode: () => {
      const currentMode = get().debugMode
      const modes = Object.values(DebugMode)
      const currentIndex = modes.indexOf(currentMode)
      const nextIndex = (currentIndex + 1) % modes.length
      set({ debugMode: modes[nextIndex] })
    },
    
    isDebugEnabled: () => {
      return get().debugMode !== DebugMode.OFF
    },
  })
)
 */
