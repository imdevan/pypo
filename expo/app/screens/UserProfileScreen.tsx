import React from "react"
import { ViewStyle } from "react-native"
import { Screen } from "@/components/lib/Screen"
import { Text } from "@/components/lib/Text"
import { Button } from "@/components/lib/Button"
import { V } from "@/components/V"
import { useAuth } from "@/context/AuthContext"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { useCurrentUserData } from "@/services/api/hooks"

/**
 * UserProfileScreen displays user information and profile details
 */
export function UserProfileScreen() {
  const { authEmail, logout } = useAuth()
  const { themed } = useAppTheme()
  const { data: userData, isLoading, error } = useCurrentUserData()

  return (
    <Screen 
      preset="auto" 
    >
      <V style={themed($container)}>
        {/* Header Section */}
        <V style={themed($headerSection)}>
          <Text
            text="User Profile"
            style={themed($title)}
          />
        </V>

        {/* User Information Section */}
        <V style={themed($infoSection)}>
          {isLoading ? (
            <V style={themed($infoCard)}>
              <Text
                text="Loading user data..."
                style={themed($value)}
              />
            </V>
          ) : error ? (
            <V style={themed($infoCard)}>
              <Text
                text="Error loading user data"
                style={themed($errorValue)}
              />
            </V>
          ) : userData ? (
            <>
              <V style={themed($infoCard)}>
                <Text
                  text="Email Address"
                  style={themed($label)}
                />
                <Text
                  text={userData.email || "No email available"}
                  style={themed($value)}
                />
              </V>

              <V style={themed($infoCard)}>
                <Text
                  text="Full Name"
                  style={themed($label)}
                />
                <Text
                  text={userData.full_name || "No name provided"}
                  style={themed($value)}
                />
              </V>

              <V style={themed($infoCard)}>
                <Text
                  text="Account Status"
                  style={themed($label)}
                />
                <Text
                  text={userData.is_active ? "Active" : "Inactive"}
                  style={themed(userData.is_active ? $statusValue : $errorValue)}
                />
              </V>

              <V style={themed($infoCard)}>
                <Text
                  text="Member Since"
                  style={themed($label)}
                />
                <Text
                  text={new Date(userData.created_at).toLocaleDateString()}
                  style={themed($value)}
                />
              </V>

              <V style={themed($infoCard)}>
                <Text
                  text="Last Updated"
                  style={themed($label)}
                />
                <Text
                  text={new Date(userData.updated_at).toLocaleDateString()}
                  style={themed($value)}
                />
              </V>

              {userData.is_superuser && (
                <V style={themed($infoCard)}>
                  <Text
                    text="User Role"
                    style={themed($label)}
                  />
                  <Text
                    text="Superuser"
                    style={themed($superuserValue)}
                  />
                </V>
              )}
            </>
          ) : (
            <V style={themed($infoCard)}>
              <Text
                text="No user data available"
                style={themed($value)}
              />
            </V>
          )}
        </V>

        {/* Actions Section */}
        <V style={themed($actionsSection)}>
          <Button
            text="Edit Profile"
            style={themed($editButton)}
            textStyle={themed($editButtonText)}
            onPress={() => {
              // TODO: Implement edit profile functionality
              console.log("Edit profile pressed")
            }}
          />
          
          <Button
            text="Logout"
            onPress={logout}
            style={themed($logoutButton)}
            textStyle={themed($logoutButtonText)}
          />
        </V>
      </V>
    </Screen>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  paddingHorizontal: spacing.lg,
  marginBottom: spacing.lg,
})

const $headerSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  marginBottom: spacing.xl,
})

const $iconColor = ({ colors }: any) => colors.tint

const $title: ThemedStyle<any> = ({ colors, spacing, typography }) => ({
  fontSize: 24,
  fontFamily: typography.primary.bold,
  color: colors.text,
})

const $infoSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
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

const $value: ThemedStyle<any> = ({ colors, spacing, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.normal,
  color: colors.text,
})

const $statusValue: ThemedStyle<any> = ({ colors, spacing, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.medium,
  color: colors.palette.primary500,
})

const $errorValue: ThemedStyle<any> = ({ colors, spacing, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.medium,
  color: colors.error,
})

const $superuserValue: ThemedStyle<any> = ({ colors, spacing, typography }) => ({
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
