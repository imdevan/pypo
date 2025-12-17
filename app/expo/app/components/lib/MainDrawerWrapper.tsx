import { FC, ReactNode } from "react"
import { Drawer } from "react-native-drawer-layout"

import { useDrawer } from "@/context/DrawerContext"
import { isRTL } from "@/i18n"

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
export const MainDrawerWrapper: FC<DrawerWrapperProps> = ({ children }) => {
  const { isOpen, openDrawer, closeDrawer, toggleDrawer } = useDrawer("app")

  return (
    <Drawer
      open={isOpen}
      onOpen={openDrawer}
      onClose={closeDrawer}
      drawerType="back"
      drawerPosition={isRTL ? "right" : "left"}
      renderDrawerContent={AppDrawer}
    >
      <ScreenWithHeader onDrawerToggle={toggleDrawer}>{children}</ScreenWithHeader>
    </Drawer>
  )
}
