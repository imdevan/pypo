import React from "react"
import { V } from "@/components/V"
import { Text } from "@/components/lib/Text"
import { Button } from "@/components/lib/Button"
import { Icon } from "@/components/lib/Icon"
import { useAuth } from "@/context/AuthContext"
import { useAppTheme } from "@/theme/context"
import { useDrawer } from "@/context/DrawerContext"
import { useNavigation, CommonActions } from "@react-navigation/native"
import { translate } from "@/i18n/translate"
import type { ThemedStyle } from "@/theme/types"
import type { ViewStyle, TextStyle } from "react-native"
import { Pressable } from "react-native"

/**
 * AppDrawer component that shows user information and logout button
 */
export function AppDrawer() {
  const { authEmail, logout } = useAuth()
  const { themed } = useAppTheme()
  const { closeDrawer } = useDrawer()
  const navigation = useNavigation()
  
  // Navigation items for demo tabs
  const navigationItems = [
    { 
      label: translate("demoNavigator:componentsTab"), 
      screen: 'DemoShowroom' as const,
      icon: "components" as const
    },
    { 
      label: translate("demoNavigator:itemsTab"), 
      screen: 'DemoItems' as const,
      icon: "podcast" as const
    },
    { 
      label: translate("demoNavigator:communityTab"), 
      screen: 'DemoCommunity' as const,
      icon: "community" as const
    },
    { 
      label: translate("demoNavigator:debugTab"), 
      screen: 'DemoDebug' as const,
      icon: "debug" as const
    },
  ]

  const handleNavigation = (screen: string) => {
    closeDrawer()
    navigation.navigate(screen as never)
  }
  
  return (
    <V style={themed($drawerContainer)}>
      <V style={themed($userSection)}>
        <Icon icon="settings" size={60} color={themed($iconColor)} />
        <Text
          text={authEmail || "Guest User"}
          style={themed($userName)}
        />
        <Text
          text="Welcome to the demo app!"
          style={themed($welcomeText)}
        />
      </V>
      
      <V style={themed($navigationSection)}>
        <Text
          text="Navigation"
          style={themed($sectionTitle)}
        />
        {navigationItems.map((item, index) => (
          <Pressable
            key={item.screen}
            onPress={() => handleNavigation(item.screen)}
            style={themed($navItemPressable)}
          >
            <V style={themed($navItemContainer)}>
              <Icon icon={item.icon} size={20} color={themed($navIconColor)} />
              <Text
                text={item.label}
                style={themed($navItem)}
              />
            </V>
          </Pressable>
        ))}
      </V>
      
      <Button
        text="Logout"
        onPress={logout}
        style={themed($logoutButton)}
        textStyle={themed($logoutButtonText)}
      />
    </V>
  )
}

const $drawerContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  backgroundColor: colors.background,
  padding: spacing.lg,
  paddingTop: spacing.xl * 2,
})

const $userSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xl,
})

const $iconColor = ({ colors }: any) => colors.tint

const $userName: ThemedStyle<TextStyle> = ({ colors, spacing, typography }) => ({
  fontSize: 18,
  fontFamily: typography.primary.bold,
  color: colors.text,
  marginTop: spacing.sm,
})

const $welcomeText: ThemedStyle<TextStyle> = ({ colors, spacing, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.normal,
  color: colors.textDim,
  marginTop: spacing.xs,
})

const $navigationSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
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

const $navItemPressable: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.sm,
  borderRadius: spacing.xs,
  padding: spacing.sm,
})

const $navItemContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
})

const $navIconColor = ({ colors }: any) => colors.tint

const $logoutButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.error,
  marginTop: spacing.lg,
})

const $logoutButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.background,
}) 