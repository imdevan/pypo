import React, { createContext, FC, PropsWithChildren, useContext, useState, useCallback, useRef } from "react"
import { DrawerActions } from "@react-navigation/native"
import type { NavigationContainerRef, ParamListBase } from "@react-navigation/native"

export type DrawerContextType = {
  isOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
  navigateFromDrawer: (screen: string, params?: any) => void
  setNavigationRef: (ref: NavigationContainerRef<ParamListBase> | null) => void
}

export const DrawerContext = createContext<DrawerContextType | null>(null)

export interface DrawerProviderProps {}

export const DrawerProvider: FC<PropsWithChildren<DrawerProviderProps>> = ({ 
  children
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const navigationRef = useRef<NavigationContainerRef<ParamListBase> | null>(null)

  const openDrawer = useCallback(() => {
    setIsOpen(true)
    if (navigationRef.current) {
      navigationRef.current.dispatch(DrawerActions.openDrawer())
    }
  }, [])

  const closeDrawer = useCallback(() => {
    setIsOpen(false)
    if (navigationRef.current) {
      navigationRef.current.dispatch(DrawerActions.closeDrawer())
    }
  }, [])

  const toggleDrawer = useCallback(() => {
    if (isOpen) {
      closeDrawer()
    } else {
      openDrawer()
    }
  }, [isOpen, openDrawer, closeDrawer])

  const navigateFromDrawer = useCallback((screen: string, params?: any) => {
    if (navigationRef.current) {
      // Use any to bypass strict typing for dynamic navigation
      (navigationRef.current as any).navigate(screen, params)
      closeDrawer()
    }
  }, [closeDrawer])

  const setNavigationRef = useCallback((ref: NavigationContainerRef<ParamListBase> | null) => {
    navigationRef.current = ref
  }, [])

  const value: DrawerContextType = {
    isOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    navigateFromDrawer,
    setNavigationRef,
  }

  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>
}

export const useDrawer = () => {
  const context = useContext(DrawerContext)
  if (!context) throw new Error("useDrawer must be used within a DrawerProvider")
  return context
} 