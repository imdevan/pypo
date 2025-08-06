import { createContext, FC, PropsWithChildren, useContext } from "react"

export type DrawerContextType = {
  openDrawer: () => void
  closeDrawer: () => void
}

export const DrawerContext = createContext<DrawerContextType | null>(null)

export interface DrawerProviderProps {
  openDrawer: () => void
  closeDrawer: () => void
}

export const DrawerProvider: FC<PropsWithChildren<DrawerProviderProps>> = ({ 
  children, 
  openDrawer, 
  closeDrawer 
}) => {
  const value = {
    openDrawer,
    closeDrawer,
  }

  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>
}

export const useDrawer = () => {
  const context = useContext(DrawerContext)
  if (!context) throw new Error("useDrawer must be used within a DrawerProvider")
  return context
} 