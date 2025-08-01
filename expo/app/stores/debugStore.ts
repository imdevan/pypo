import { create } from "zustand"

export enum DebugMode {
  OFF = "off",
  BASIC = "basic",
  VERBOSE = "verbose",
}

interface DebugState {
  debugMode: DebugMode
  setDebugMode: (mode: DebugMode) => void
  toggleDebugMode: () => void
  isDebugEnabled: () => boolean
}

export const useDebugStore = create<DebugState>((set, get) => ({
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
})) 