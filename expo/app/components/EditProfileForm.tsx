import React, { useState } from "react"
import { ViewStyle, Alert } from "react-native"
import { Screen } from "@/components/lib/Screen"
import { Text } from "@/components/lib/Text"
import { Button } from "@/components/lib/Button"
import { TextField } from "@/components/lib/TextField"
import { V } from "@/components/V"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { useUpdateCurrentUserData } from "@/services/api/hooks"
import { zUserUpdateMe } from "@/client/zod.gen"
import type { UserPublic } from "@/client/types.gen"

interface EditProfileFormProps {
  userData: UserPublic
  onCancel: () => void
  onSuccess: () => void
}

/**
 * EditProfileForm allows users to edit their profile information
 */
export function EditProfileForm({ userData, onCancel, onSuccess }: EditProfileFormProps) {
  const { themed } = useAppTheme()
  const updateUserMutation = useUpdateCurrentUserData()
  
  const [formData, setFormData] = useState({
    full_name: userData.full_name || "",
    email: userData.email || "",
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    try {
      zUserUpdateMe.parse(formData)
      setErrors({})
      return true
    } catch (error: any) {
      const newErrors: Record<string, string> = {}
      if (error.errors) {
        error.errors.forEach((err: any) => {
          const field = err.path[0]
          newErrors[field] = err.message
        })
      }
      setErrors(newErrors)
      return false
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    try {
      await updateUserMutation.mutateAsync({
        body: {
          full_name: formData.full_name || null,
          email: formData.email || null,
        }
      })
      
      Alert.alert("Success", "Profile updated successfully!")
      onSuccess()
    } catch (error: any) {
      Alert.alert(
        "Error", 
        error.response?.data?.detail?.[0]?.msg || "Failed to update profile"
      )
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Screen preset="auto">
      <V style={themed($container)}>
        {/* Header Section */}
        <V style={themed($headerSection)}>
          <Text
            text="Edit Profile"
            style={themed($title)}
          />
        </V>

        {/* Form Section */}
        <V style={themed($formSection)}>
          <V style={themed($formCard)}>
            <Text
              text="Full Name"
              style={themed($label)}
            />
            <TextField
              value={formData.full_name}
              onChangeText={(text) => handleInputChange("full_name", text)}
              placeholder="Enter your full name"
              inputWrapperStyle={themed($input)}
              style={themed($inputText)}
              helper={errors.full_name}
              helperTx={undefined}
              status={errors.full_name ? "error" : undefined}
            />
          </V>

          <V style={themed($formCard)}>
            <Text
              text="Email Address"
              style={themed($label)}
            />
            <TextField
              value={formData.email}
              onChangeText={(text) => handleInputChange("email", text)}
              placeholder="Enter your email address"
              inputWrapperStyle={themed($input)}
              style={themed($inputText)}
              helper={errors.email}
              helperTx={undefined}
              keyboardType="email-address"
              autoCapitalize="none"
              status={errors.email ? "error" : undefined}
            />
          </V>
        </V>

        {/* Actions Section */}
        <V style={themed($actionsSection)}>
          <Button
            text="Save Changes"
            onPress={handleSubmit}
            style={themed($saveButton)}
            textStyle={themed($saveButtonText)}
            disabled={updateUserMutation.isPending}
          />
          
          <Button
            text="Cancel"
            onPress={onCancel}
            style={themed($cancelButton)}
            textStyle={themed($cancelButtonText)}
            disabled={updateUserMutation.isPending}
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

const $title: ThemedStyle<any> = ({ colors, spacing, typography }) => ({
  fontSize: 24,
  fontFamily: typography.primary.bold,
  color: colors.text,
})

const $formSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  marginBottom: spacing.xl,
})

const $formCard: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $label: ThemedStyle<any> = ({ colors, spacing, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.textDim,
  marginBottom: spacing.xs,
})

const $input: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: spacing.sm,
  paddingHorizontal: spacing.md,
})

const $inputText: ThemedStyle<any> = ({ colors, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.normal,
  color: colors.text,
})

const $actionsSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.md,
})

const $saveButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.tint,
  marginBottom: spacing.sm,
})

const $saveButtonText: ThemedStyle<any> = ({ colors }) => ({
  color: colors.background,
})

const $cancelButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral300,
})

const $cancelButtonText: ThemedStyle<any> = ({ colors }) => ({
  color: colors.text,
})
