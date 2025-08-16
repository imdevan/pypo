import { FC, ReactNode, useRef, useCallback } from "react"
import { Image, ImageStyle, View, ViewStyle } from "react-native"
import { type ContentStyle } from "@shopify/flash-list"
import { Drawer } from "react-native-drawer-layout"

import { ListView, type ListViewRef } from "@/components/lib/ListView"
import { useDrawer } from "@/context/DrawerContext"
import { isRTL } from "@/i18n"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

import { ScreenWithHeader } from "./ScreenWithHeader"

const logo = require("@assets/images/logo.png")

export interface DrawerItem {
  name: string
  useCases: string[]
}

export interface DrawerWrapperProps {
  children: ReactNode
  drawerData: DrawerItem[]
  onItemPress?: (sectionIndex: number, itemIndex?: number) => void
  drawerId: string
}

export const DrawerWrapper: FC<DrawerWrapperProps> = ({
  children,
  drawerData,
  onItemPress,
  drawerId,
}) => {
  const menuRef = useRef<ListViewRef<DrawerItem>>(null)
  const { themed } = useAppTheme()
  // const $drawerInsets = useSafeAreaInsetsStyle(["top"])
  const { isOpen, openDrawer, closeDrawer, toggleDrawer } = useDrawer(drawerId)

  return (
    <Drawer
      open={isOpen}
      onOpen={openDrawer}
      onClose={closeDrawer}
      drawerType="back"
      drawerPosition={isRTL ? "right" : "left"}
      renderDrawerContent={() => (
        <View style={themed([$drawer])}>
          <View style={themed($logoContainer)}>
            <Image source={logo} style={$logoImage} />
          </View>
          <ListView<DrawerItem>
            showsVerticalScrollIndicator={false}
            ref={menuRef}
            contentContainerStyle={themed($listContentContainer)}
            estimatedItemSize={250}
            data={drawerData}
            keyExtractor={(item) => item.name}
            renderItem={({ item, index: sectionIndex }) => (
              <DrawerListItem item={item} sectionIndex={sectionIndex} onItemPress={onItemPress} />
            )}
          />
        </View>
      )}
    >
      <ScreenWithHeader onDrawerToggle={toggleDrawer}>{children}</ScreenWithHeader>
    </Drawer>
  )
}

interface DrawerListItemProps {
  item: DrawerItem
  sectionIndex: number
  onItemPress?: (sectionIndex: number, itemIndex?: number) => void
}

const DrawerListItem: FC<DrawerListItemProps> = ({ item, sectionIndex, onItemPress }) => {
  const { themed } = useAppTheme()
  const { Text } = require("@/components/lib/Text")
  const { ListItem } = require("@/components/lib/ListItem")

  return (
    <View>
      <Text
        onPress={() => onItemPress?.(sectionIndex)}
        preset="bold"
        style={themed($menuContainer)}
      >
        {item.name}
      </Text>
      {item.useCases.map((useCase, index) => (
        <ListItem
          key={`section${sectionIndex}-${useCase}`}
          onPress={() => onItemPress?.(sectionIndex, index)}
          text={useCase}
          rightIcon={isRTL ? "caretLeft" : "caretRight"}
        />
      ))}
    </View>
  )
}

// Styles
const $drawer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  flex: 1,
})

const $listContentContainer: ThemedStyle<ContentStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
})

const $logoImage: ImageStyle = {
  height: 42,
  width: 77,
}

const $logoContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignSelf: "flex-start",
  justifyContent: "center",
  height: 56,
  paddingHorizontal: spacing.lg,
})

const $menuContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.xs,
  paddingTop: spacing.lg,
})
