import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useMemo,
  useRef,
  useState,
  useCallback,
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

  // Memoize the context value to prevent unnecessary re-renders of all consumers
  const value: DrawerContextType = useMemo(
    () => ({
      drawers,
      isOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      navigateFromDrawer,
      setNavigationRef,
    }),
    [drawers, isOpen, openDrawer, closeDrawer, toggleDrawer, navigateFromDrawer, setNavigationRef],
  )

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

  // Get the current isOpen state directly from drawers to avoid function reference issues
  // Read directly from context.drawers to get the actual state value
  const isOpenState = context.drawers[drawerId]?.isOpen || false

  // Use refs to store the latest function references without causing re-renders
  const contextRef = useRef(context)
  contextRef.current = context

  // Memoize the return value to prevent creating new objects on every render
  // Only recreate when isOpenState changes (actual drawer state change)
  // Use refs for functions so they're always current but don't trigger re-renders
  return useMemo(
    () => ({
      isOpen: isOpenState,
      openDrawer: () => contextRef.current.openDrawer(drawerId),
      closeDrawer: () => contextRef.current.closeDrawer(drawerId),
      toggleDrawer: () => contextRef.current.toggleDrawer(drawerId),
      navigateFromDrawer: (screen: string, params?: any) =>
        contextRef.current.navigateFromDrawer(drawerId, screen, params),
      setNavigationRef: contextRef.current.setNavigationRef,
    }),
    // Only depend on isOpenState and drawerId - functions accessed via ref so always current
    [isOpenState, drawerId],
  )
}

/**
 * Hook for accessing the full drawer context (for advanced use cases)
 */
export const useDrawerContext = () => {
  const context = useContext(DrawerContext)
  if (!context) throw new Error("useDrawerContext must be used within a DrawerProvider")
  return context
}
