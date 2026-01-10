import { FC, memo, ReactNode, useCallback, useMemo } from "react"
import { Drawer } from "react-native-drawer-layout"

import { useDrawer } from "@/context/DrawerContext"
import { isRTL } from "@/i18n"
import { useMountLog } from "@/utils/useMountLog"

import { ScreenWithHeader } from "./ScreenWithHeader"
import { AppDrawer } from "../demo/AppDrawer"

export interface DrawerItem {
  name: string
  useCases: string[]
}

export interface DrawerWrapperProps {
  children: ReactNode
  onItemPress?: (sectionIndex: number, itemIndex?: number) => void
}

/**
 * Main Drawer Wrapper
 * This is the main drawer wrapper that is used to wrap the app drawer content
 */
const MainDrawerWrapperComponent: FC<DrawerWrapperProps> = ({ children }) => {
  useMountLog("MainDrawerWrapper", { logRenders: true })

  const { isOpen, openDrawer, closeDrawer, toggleDrawer } = useDrawer("app")

  // Memoize callbacks to prevent Drawer component from re-rendering
  const handleOpen = useCallback(() => {
    openDrawer()
  }, [openDrawer])

  const handleClose = useCallback(() => {
    closeDrawer()
  }, [closeDrawer])

  // Memoize drawer position to prevent recreation
  const drawerPosition = useMemo(() => (isRTL ? "right" : "left"), [])

  return (
    <Drawer
      open={isOpen}
      onOpen={handleOpen}
      onClose={handleClose}
      drawerType="back"
      drawerPosition={drawerPosition}
      renderDrawerContent={AppDrawer}
    >
      <ScreenWithHeader onDrawerToggle={toggleDrawer}>{children}</ScreenWithHeader>
    </Drawer>
  )
}

// Memoize with custom comparison - only re-render if children actually change
export const MainDrawerWrapper = memo(MainDrawerWrapperComponent, (prevProps, nextProps) => {
  // Only re-render if children reference changes
  return prevProps.children === nextProps.children
})
