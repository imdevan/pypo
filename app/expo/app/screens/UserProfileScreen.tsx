import React, { useState } from "react"
import { ViewStyle } from "react-native"
import { View } from "react-native"

import { EditProfileForm } from "@/components/demo/EditProfileForm"
import { Button } from "@/components/lib/Button"
import { Screen } from "@/components/lib/Screen"
import { Text } from "@/components/lib/Text"
import { useAuth } from "@/context/AuthContext"
import { useCurrentUserData } from "@/services/api/hooks"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { $styles } from "@/theme/styles"

/**
 * UserProfileScreen displays user information and profile details
 */
export function UserProfileScreen() {
  const { logout } = useAuth()
  const { themed } = useAppTheme()
  const { data: userData, isLoading, error } = useCurrentUserData()
  const [isEditing, setIsEditing] = useState(false)

  // Show edit form when in editing mode
  if (isEditing && userData) {
    return (
      <Screen preset="auto" contentContainerStyle={themed($styles.container)}>
        <EditProfileForm
          userData={userData}
          onCancel={() => setIsEditing(false)}
          onSuccess={() => setIsEditing(false)}
        />
      </Screen>
    )
  }

  return (
    <Screen preset="auto" contentContainerStyle={themed($container)}>
      {/* Header Section */}
      <View style={themed($headerSection)}>
        <Text text="User Profile" style={themed($title)} />
      </View>

      {/* User Information Section */}
      <View style={themed($infoSection)}>
        {isLoading ? (
          <View style={themed($infoCard)}>
            <Text text="Loading user data..." style={themed($value)} />
          </View>
        ) : error ? (
          <View style={themed($infoCard)}>
            <Text text="Error loading user data" style={themed($errorValue)} />
          </View>
        ) : userData ? (
          <>
            <View style={themed($infoCard)}>
              <Text text="Email Address" style={themed($label)} />
              <Text text={userData.email || "No email available"} style={themed($value)} />
            </View>

            <View style={themed($infoCard)}>
              <Text text="Full Name" style={themed($label)} />
              <Text text={userData.full_name || "No name provided"} style={themed($value)} />
            </View>

            <View style={themed($infoCard)}>
              <Text text="Account Status" style={themed($label)} />
              <Text
                text={userData.is_active ? "Active" : "Inactive"}
                style={themed(userData.is_active ? $statusValue : $errorValue)}
              />
            </View>

            <View style={themed($infoCard)}>
              <Text text="Member Since" style={themed($label)} />
              <Text
                text={new Date(userData.created_at).toLocaleDateString()}
                style={themed($value)}
              />
            </View>

            <View style={themed($infoCard)}>
              <Text text="Last Updated" style={themed($label)} />
              <Text
                text={new Date(userData.updated_at).toLocaleDateString()}
                style={themed($value)}
              />
            </View>

            {userData.is_superuser && (
              <View style={themed($infoCard)}>
                <Text text="User Role" style={themed($label)} />
                <Text text="Superuser" style={themed($superuserValue)} />
              </View>
            )}
          </>
        ) : (
          <View style={themed($infoCard)}>
            <Text text="No user data available" style={themed($value)} />
          </View>
        )}
      </View>

      {/* Actions Section */}
      <View style={themed($actionsSection)}>
        <Button
          text="Edit Profile"
          style={themed($editButton)}
          textStyle={themed($editButtonText)}
          onPress={() => setIsEditing(true)}
        />

        <Button
          text="Logout"
          onPress={logout}
          style={themed($logoutButton)}
          textStyle={themed($logoutButtonText)}
        />
      </View>
    </Screen>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.lg,
  paddingBottom: spacing.xxl,
})

const $headerSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  marginBottom: spacing.xl,
})

const $title: ThemedStyle<any> = ({ colors, typography }) => ({
  fontSize: 24,
  fontFamily: typography.primary.bold,
  color: colors.text,
})

const $infoSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xl,
})

const $infoCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  padding: spacing.lg,
  borderRadius: spacing.sm,
  marginBottom: spacing.md,
  borderWidth: 1,
  borderColor: colors.border,
})

const $label: ThemedStyle<any> = ({ colors, spacing, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.textDim,
  marginBottom: spacing.xs,
})

const $value: ThemedStyle<any> = ({ colors, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.normal,
  color: colors.text,
})

const $statusValue: ThemedStyle<any> = ({ colors, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.medium,
  color: colors.palette.primary500,
})

const $errorValue: ThemedStyle<any> = ({ colors, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.medium,
  color: colors.error,
})

const $superuserValue: ThemedStyle<any> = ({ colors, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.medium,
  color: colors.palette.accent500,
})

const $actionsSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.md,
})

const $editButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.tint,
  marginBottom: spacing.sm,
})

const $editButtonText: ThemedStyle<any> = ({ colors }) => ({
  color: colors.background,
})

const $logoutButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.error,
})

const $logoutButtonText: ThemedStyle<any> = ({ colors }) => ({
  color: colors.background,
})
