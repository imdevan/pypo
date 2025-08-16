import React, {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react"
import { DrawerActions } from "@react-navigation/native"
import type { NavigationContainerRef, ParamListBase } from "@react-navigation/native"

export type DrawerState = {
  isOpen: boolean
}

export type DrawerContextType = {
  drawers: Record<string, DrawerState>
  isOpen: (drawerId: string) => boolean
  openDrawer: (drawerId: string) => void
  closeDrawer: (drawerId: string) => void
  toggleDrawer: (drawerId: string) => void
  navigateFromDrawer: (drawerId: string, screen: string, params?: any) => void
  setNavigationRef: (ref: NavigationContainerRef<ParamListBase> | null) => void
}

export type SpecificDrawerType = {
  isOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
  navigateFromDrawer: (screen: string, params?: any) => void
  setNavigationRef: (ref: NavigationContainerRef<ParamListBase> | null) => void
}

export const DrawerContext = createContext<DrawerContextType | null>(null)

export interface DrawerProviderProps {}

export const DrawerProvider: FC<PropsWithChildren<DrawerProviderProps>> = ({ children }) => {
  const [drawers, setDrawers] = useState<Record<string, DrawerState>>({})
  const navigationRef = useRef<NavigationContainerRef<ParamListBase> | null>(null)

  const isOpen = useCallback(
    (drawerId: string) => {
      return drawers[drawerId]?.isOpen || false
    },
    [drawers],
  )

  const openDrawer = useCallback((drawerId: string) => {
    setDrawers((prev) => ({
      ...prev,
      [drawerId]: { isOpen: true },
    }))
    if (navigationRef.current) {
      navigationRef.current.dispatch(DrawerActions.openDrawer())
    }
  }, [])

  const closeDrawer = useCallback((drawerId: string) => {
    setDrawers((prev) => ({
      ...prev,
      [drawerId]: { isOpen: false },
    }))
    if (navigationRef.current) {
      navigationRef.current.dispatch(DrawerActions.closeDrawer())
    }
  }, [])

  const toggleDrawer = useCallback(
    (drawerId: string) => {
      if (isOpen(drawerId)) {
        closeDrawer(drawerId)
      } else {
        openDrawer(drawerId)
      }
    },
    [isOpen, openDrawer, closeDrawer],
  )

  const navigateFromDrawer = useCallback(
    (drawerId: string, screen: string, params?: any) => {
      if (navigationRef.current) {
        // Use any to bypass strict typing for dynamic navigation
        ;(navigationRef.current as any).navigate(screen, params)
        closeDrawer(drawerId)
      }
    },
    [closeDrawer],
  )

  const setNavigationRef = useCallback((ref: NavigationContainerRef<ParamListBase> | null) => {
    navigationRef.current = ref
  }, [])

  const value: DrawerContextType = {
    drawers,
    isOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    navigateFromDrawer,
    setNavigationRef,
  }

  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>
}

type UseDrawerType = (drawerId?: string) => SpecificDrawerType

/**
 * Hook for using a specific drawer by ID
 * @param drawerId - The unique identifier for the drawer
 */
export const useDrawer: UseDrawerType = (drawerId = "app") => {
  const context = useContext(DrawerContext)
  if (!context) throw new Error("useDrawer must be used within a DrawerProvider")

  return {
    isOpen: context.isOpen(drawerId),
    openDrawer: () => context.openDrawer(drawerId),
    closeDrawer: () => context.closeDrawer(drawerId),
    toggleDrawer: () => context.toggleDrawer(drawerId),
    navigateFromDrawer: (screen: string, params?: any) =>
      context.navigateFromDrawer(drawerId, screen, params),
    setNavigationRef: context.setNavigationRef,
  }
}

/**
 * Hook for accessing the full drawer context (for advanced use cases)
 */
export const useDrawerContext = () => {
  const context = useContext(DrawerContext)
  if (!context) throw new Error("useDrawerContext must be used within a DrawerProvider")
  return context
}
