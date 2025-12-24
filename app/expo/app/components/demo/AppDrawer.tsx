import type { ViewStyle, TextStyle } from "react-native"
import { Pressable, View } from "react-native"
import { useNavigation, CommonActions, NavigationProp } from "@react-navigation/native"

import { Button } from "@/components/lib/Button"
import { Icon } from "@/components/lib/Icon"
import { Text } from "@/components/lib/Text"
import { useAuth } from "@/context/AuthContext"
import { useDrawer } from "@/context/DrawerContext"
import { translate } from "@/i18n/translate"
import { AppStackParamList } from "@/navigators/AppNavigator"
import { DrawNavigatorParamList } from "@/navigators/DrawerNavigator"
import { DemoTabParamList } from "@/navigators/TabNavigator"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

/**
 * AppDrawer component that shows user information and logout button
 *
 * Navigation Structure:
 * - AppNavigator (Stack) → contains "Drawer" screen
 * - DrawerNavigator (Stack) → contains "tab", "development/showroom", etc.
 * - TabNavigator (Bottom Tabs) → contains "items", "community"
 *
 * To navigate to specific tabs from the drawer, we use CommonActions.navigate
 * to navigate through the nested navigator structure.
 */
export function AppDrawer() {
  const { authEmail, logout } = useAuth()
  const { themed } = useAppTheme()
  const { closeDrawer } = useDrawer()
  const navigation = useNavigation<NavigationProp<AppStackParamList>>()

  // Navigation items for demo tabs
  const navigationItems = [
    {
      label: translate("tabNavigator:itemsTab"),
      screen: "items" as const,
      icon: "podcast" as const,
    },
    {
      label: translate("tabNavigator:communityTab"),
      screen: "community" as const,
      icon: "community" as const,
    },
  ]

  const handleNavigation = (screen: keyof DemoTabParamList) => {
    closeDrawer()
    try {
      // Use CommonActions to navigate to nested screens
      navigation.dispatch(
        CommonActions.navigate({
          name: "app",
          params: {
            screen: "tab",
            params: {
              screen,
            },
          },
        }),
      )
    } catch (error) {
      console.error("Navigation error:", error)
    }
  }

  const handleUserProfileNavigation = () => {
    closeDrawer()
    try {
      // Navigate to UserProfile screen in DrawerNavigator
      navigation.dispatch(
        CommonActions.navigate({
          name: "app",
          params: {
            screen: "userprofile",
          },
        }),
      )
    } catch (error) {
      console.error("Navigation error:", error)
    }
  }

  const handleTagsNavigation = () => {
    closeDrawer()
    try {
      // Navigate to Tags screen in DrawerNavigator
      navigation.dispatch(
        CommonActions.navigate({
          name: "app",
          params: {
            screen: "tags",
          },
        }),
      )
    } catch (error) {
      console.error("Navigation error:", error)
    }
  }

  const handleDevelopmentNavigation = (screen: "development/showroom" | "development/debug") => {
    closeDrawer()
    try {
      // Navigate to development screen in DrawerNavigator
      navigation.dispatch(
        CommonActions.navigate({
          name: "app",
          params: {
            screen,
          },
        }),
      )
    } catch (error) {
      console.error("Navigation error:", error)
    }
  }

  return (
    <View style={themed($drawerContainer)}>
      <View style={themed($contentSection)}>
        <View style={themed($userSection)}>
          <Pressable
            onPress={() => handleUserProfileNavigation()}
            style={themed($userNamePressable)}
          >
            <View style={themed($userNameContainer)}>
              <Text text={authEmail || "Guest User"} style={themed($userName)} />
              <Icon icon="settings" size={16} />
            </View>
          </Pressable>
          <Text text="Welcome to the demo app!" style={themed($welcomeText)} />
        </View>

        <View style={themed($navigationSection)}>
          <Text text="Navigation" style={themed($sectionTitle)} />
          {navigationItems.map((item) => (
            <Pressable
              key={item.screen}
              onPress={() => handleNavigation(item.screen)}
              style={themed($navItemPressable)}
            >
              <View style={themed($navItemContainer)}>
                <Icon icon={item.icon} size={20} />
                <Text text={item.label} style={themed($navItem)} />
              </View>
            </Pressable>
          ))}
        </View>

        <View style={themed($managementSection)}>
          <Text text="Management" style={themed($sectionTitle)} />
          <Pressable onPress={() => handleTagsNavigation()} style={themed($navItemPressable)}>
            <View style={themed($navItemContainer)}>
              <Icon icon="components" size={20} />
              <Text text="Tags" style={themed($navItem)} />
            </View>
          </Pressable>
        </View>

        <View style={themed($developmentSection)}>
          <Text text="Development" style={themed($sectionTitle)} />
          <Pressable
            onPress={() => handleDevelopmentNavigation("development/showroom")}
            style={themed($navItemPressable)}
          >
            <View style={themed($navItemContainer)}>
              <Icon name="layers" size={20} />
              <Text text="Showroom" style={themed($navItem)} />
            </View>
          </Pressable>
          <Pressable
            onPress={() => handleDevelopmentNavigation("development/debug")}
            style={themed($navItemPressable)}
          >
            <View style={themed($navItemContainer)}>
              <Icon name="code" size={20} />
              <Text text="Debug" style={themed($navItem)} />
            </View>
          </Pressable>
        </View>
      </View>

      <Button preset="outline" text="Logout" onPress={logout} />
    </View>
  )
}

const $drawerContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  backgroundColor: colors.background,
  padding: spacing.lg,
  paddingTop: spacing.xl * 2,
  justifyContent: "space-between",
})

const $contentSection: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $userSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xl,
})

const $userName: ThemedStyle<TextStyle> = ({ colors, spacing, typography }) => ({
  fontSize: 18,
  fontFamily: typography.primary.bold,
  color: colors.text,
  marginTop: spacing.sm,
})

const $userNamePressable: ThemedStyle<ViewStyle> = () => ({})

const $userNameContainer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
})

const $welcomeText: ThemedStyle<TextStyle> = ({ colors, spacing, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.normal,
  color: colors.textDim,
  marginTop: spacing.xs,
})

const $navigationSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xl,
})

const $managementSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xl,
})

const $developmentSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xl,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ colors, spacing, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.bold,
  color: colors.text,
  marginBottom: spacing.md,
})

const $navItem: ThemedStyle<TextStyle> = ({ colors, spacing, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.normal,
  color: colors.text,
  marginLeft: spacing.sm,
  flex: 1,
})

const $navItemPressable: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
  borderRadius: spacing.xs,
  padding: spacing.sm,
})

const $navItemContainer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
})
