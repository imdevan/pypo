import React from "react"
import { V } from "@/components/V"
import { Text } from "@/components/Text"
import { Button } from "@/components/Button"
import { Icon } from "@/components/Icon"
import { useAuth } from "@/context/AuthContext"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import type { ViewStyle, TextStyle } from "react-native"

/**
 * AppDrawer component that shows user information and logout button
 */
export function AppDrawer() {
  const { authEmail, logout } = useAuth()
  const { themed } = useAppTheme()
  
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
        <Text
          text="• Demo Showroom"
          style={themed($navItem)}
        />
        <Text
          text="• Items"
          style={themed($navItem)}
        />
        <Text
          text="• Community"
          style={themed($navItem)}
        />
        <Text
          text="• Debug"
          style={themed($navItem)}
        />
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

const $iconColor: ThemedStyle<ViewStyle> = ({ colors }) => ({
  color: colors.tint,
})

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
  color: colors.textDim,
  marginBottom: spacing.xs,
})

const $logoutButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.error,
  marginTop: spacing.lg,
})

const $logoutButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.background,
}) 