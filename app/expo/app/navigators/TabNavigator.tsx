import { memo, useMemo } from "react"
import { Platform, TextStyle, View, ViewStyle } from "react-native"
import { BottomTabScreenProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { CompositeScreenProps } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Icon } from "@/components/lib/Icon"
import { ThemedBlurView } from "@/components/lib/ThemedBlurView"
import { translate } from "@/i18n/translate"
import { ItemsStackNavigator } from "@/navigators/ItemsStackNavigator"
import { AddItemScreen } from "@/screens/AddItemScreen"
import { DemoCommunityScreen } from "@/screens/DemoCommunityScreen"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { useMountLog } from "@/utils/useMountLog"

import { AppStackParamList, AppStackScreenProps } from "./AppNavigator"

/**
 * Hook to get the tab bar spacing values.
 * Returns both the height and padding bottom for content that needs to account for the tab bar.
 */
export function useTabBarSpacing() {
  const { bottom } = useSafeAreaInsets()
  const height = bottom + 50
  const paddingBottom = height + 32 // Add extra spacing for content
  return { height, paddingBottom }
}

export type DemoTabParamList = {
  community: undefined
  items: undefined
  addItem: undefined
}

/**
 * Helper for automatically generating navigation prop types for each route.
 *
 * More info: https://reactnavigation.org/docs/typescript/#organizing-types
 */
export type DemoTabScreenProps<T extends keyof DemoTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<DemoTabParamList, T>,
  AppStackScreenProps<keyof AppStackParamList>
>

const Tab = createBottomTabNavigator<DemoTabParamList>()

/**
 * This is the main navigator for the demo screens with a bottom tab bar.
 * Each tab is a stack navigator with its own set of screens.
 *
 * More info: https://reactnavigation.org/docs/bottom-tab-navigator/
 * @returns {JSX.Element} The rendered `TabNavigator`.
 */
export const TabNavigator = memo(function TabNavigator() {
  useMountLog("TabNavigator", { logRenders: true })

  const { height } = useTabBarSpacing()
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  // Memoize screenOptions to prevent navigator remounts
  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      tabBarHideOnKeyboard: true,
      tabBarStyle: themed([$tabBar, { height }]),
      tabBarActiveTintColor: colors.text,
      tabBarInactiveTintColor: colors.text,
      tabBarLabelStyle: themed($tabBarLabel),
      tabBarItemStyle: themed($tabBarItem),
      tabBarBackground: () =>
        Platform.OS !== "web" ? (
          <ThemedBlurView style={themed($tabBarBlur)}>
            <View style={themed($tabBarOverlay)} />
          </ThemedBlurView>
        ) : (
          <View style={themed($tabBarWebBackground)} />
        ),
    }),
    // Dependencies: track themed function, tabBarSpacing.height, and colors.text that affect the styles
    // themed function identity is stable, but we track colors.text which changes with theme
    [themed, height, colors.text],
  )

  // Memoize screen options to prevent remounts
  const itemsTabOptions = useMemo(
    () => ({
      tabBarAccessibilityLabel: translate("tabNavigator:podcastListTab"),
      tabBarShowLabel: false,
      tabBarLabel: translate("tabNavigator:itemsTab"),
      tabBarIcon: ({ focused }: { focused: boolean }) => (
        <Icon name="list" color={focused ? colors.tint : colors.tintInactive} size={24} />
      ),
    }),
    [colors.tint, colors.tintInactive],
  )

  const addItemTabOptions = useMemo(
    () => ({
      tabBarShowLabel: false,
      tabBarLabel: "Add Item",
      tabBarIcon: ({ focused }: { focused: boolean }) => (
        <Icon name="plus" color={focused ? colors.tint : colors.tintInactive} size={24} />
      ),
    }),
    [colors.tint, colors.tintInactive],
  )

  const communityTabOptions = useMemo(
    () => ({
      tabBarShowLabel: false,
      tabBarLabel: translate("tabNavigator:communityTab"),
      tabBarIcon: ({ focused }: { focused: boolean }) => (
        <Icon name="users" color={focused ? colors.tint : colors.tintInactive} size={24} />
      ),
    }),
    [colors.tint, colors.tintInactive],
  )

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="items" component={ItemsStackNavigator} options={itemsTabOptions} />
      <Tab.Screen name="addItem" component={AddItemScreen} options={addItemTabOptions} />
      <Tab.Screen name="community" component={DemoCommunityScreen} options={communityTabOptions} />
    </Tab.Navigator>
  )
})

const $tabBar: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "transparent",
  borderTopColor: "transparent",
  borderTopWidth: 0,
  elevation: 0,
  shadowOpacity: 0,
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
})

const $tabBarBlur: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: "100%",
  height: "100%",
})

const $tabBarOverlay: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: "100%",
  height: "100%",
  backgroundColor: colors.background,
  opacity: 0,
})

const $tabBarItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.sm,
})

const $tabBarLabel: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.medium,
  lineHeight: 16,
  color: colors.text,
})

const $tabBarWebBackground: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: "100%",
  height: "100%",
  backgroundColor: colors.background + "88",
  // @ts-ignore - CSS-only property for web
  backdropFilter: "blur(10px)",
  // @ts-ignore - CSS-only property for web
  WebkitBackdropFilter: "blur(10px)",
})
