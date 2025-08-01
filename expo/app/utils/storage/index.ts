import { MMKV } from "react-native-mmkv"
import { createJSONStorage } from "zustand/middleware"

export const storage = new MMKV()

/**
 * Loads a string from storage.
 *
 * @param key The key to fetch.
 */
export function loadString(key: string): string | null {
  try {
    return storage.getString(key) ?? null
  } catch {
    // not sure why this would fail... even reading the RN docs I'm unclear
    return null
  }
}

/**
 * Saves a string to storage.
 *
 * @param key The key to fetch.
 * @param value The value to store.
 */
export function saveString(key: string, value: string): boolean {
  try {
    storage.set(key, value)
    return true
  } catch {
    return false
  }
}

/**
 * Loads something from storage and runs it thru JSON.parse.
 *
 * @param key The key to fetch.
 */
export function load<T>(key: string): T | null {
  let almostThere: string | null = null
  try {
    almostThere = loadString(key)
    return JSON.parse(almostThere ?? "") as T
  } catch {
    return (almostThere as T) ?? null
  }
}

/**
 * Saves an object to storage.
 *
 * @param key The key to fetch.
 * @param value The value to store.
 */
export function save(key: string, value: unknown): boolean {
  try {
    saveString(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/**
 * Removes something from storage.
 *
 * @param key The key to kill.
 */
export function remove(key: string): void {
  try {
    storage.delete(key)
  } catch {}
}

/**
 * Burn it all to the ground.
 */
export function clear(): void {
  try {
    storage.clearAll()
  } catch {}
}

/**
 * Creates a custom storage adapter for zustand persist with a specific prefix
 * @param prefix - Optional prefix for the storage keys
 * @returns A storage object compatible with zustand's persist middleware
 */
export function createZustandStorage(prefix?: string) {
  const getKey = (name: string) => prefix ? `${prefix}:${name}` : name
  
  return createJSONStorage(() => ({
    getItem: (name: string) => {
      const key = getKey(name)
      const value = load(key)
      return value ? JSON.stringify(value) : null
    },
    setItem: (name: string, value: string) => {
      const key = getKey(name)
      try {
        const parsedValue = JSON.parse(value)
        save(key, parsedValue)
      } catch {
        // If parsing fails, store as string
        saveString(key, value)
      }
    },
    removeItem: (name: string) => {
      const key = getKey(name)
      remove(key)
    }
  }))
}

/**
 * Helper function to create a zustand store with MMKV persistence
 * @param name - The name of the store (used as storage key)
 * @param initialState - The initial state of the store (data only, no methods)
 * @param actions - The actions to add to the store
 * @param prefix - Optional prefix for the storage key
 * @returns A zustand store with persistence
 */
export function createPersistedStore<TState extends object, TActions extends object>(
  name: string,
  initialState: TState,
  actions: (set: any, get: any) => TActions,
  prefix?: string
) {
  const { create } = require('zustand')
  const { persist } = require('zustand/middleware')
  
  return create(
    persist(
      (set: any, get: any) => ({
        ...initialState,
        ...actions(set, get)
      }),
      {
        name,
        storage: createZustandStorage(prefix)
      }
    )
  )
}