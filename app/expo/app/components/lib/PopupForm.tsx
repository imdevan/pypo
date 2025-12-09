// lib
import React, { useState, ReactNode } from "react"
import { ViewStyle } from "react-native"
import { View } from "react-native"

import { Button } from "@/components/lib/Button"
import { Text } from "@/components/lib/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface PopupFormProps {
  title?: string
  triggerText?: string
  onSuccess?: () => Promise<void> | void
  onCancel?: () => void
  children: ReactNode
  disabled?: boolean
  saveDisabled?: boolean
  error?: string | null
  onClearError?: () => void
  open?: boolean
}

/**
 * PopupForm component that manages its own visibility state and renders form content
 * as children within a styled form card
 *
 * if {open} is defined (true or false) it will override the button functionality
 */
export function PopupForm({
  title,
  open,
  triggerText = "Open Form",
  onSuccess,
  onCancel,
  children,
  disabled = false,
  saveDisabled = false,
  error = null,
  onClearError,
}: PopupFormProps) {
  const { themed } = useAppTheme()
  const [isOpen, setIsOpen] = useState(false)

  const handleOpen = () => {
    setIsOpen(true)
    onClearError?.()
  }

  const handleCancel = () => {
    setIsOpen(false)
    onCancel?.()
    onClearError?.()
  }

  const handleSuccess = async () => {
    try {
      console.log("PopupForm: Starting handleSuccess")
      await onSuccess?.()
      console.log("PopupForm: onSuccess completed successfully, closing form")
      // If we reach here, the operation was successful, so close the form
      setIsOpen(false)
      onClearError?.()
    } catch (error) {
      console.log("PopupForm: Error caught, keeping form open:", error)
      // Don't close the form if there's an error
      // The error handling should be done in the onSuccess callback
    }
  }

  return (
    <View style={themed($section)}>
      <View style={themed($sectionHeader)}>
        {title && <Text text={title} style={themed($sectionTitle)} />}

        {!isOpen && typeof open === "undefined" && (
          <Button
            text={triggerText}
            onPress={handleOpen}
            style={themed($addButton)}
            textStyle={themed($addButtonText)}
            disabled={disabled}
          />
        )}
      </View>

      {isOpen ||
        (!(typeof open === "undefined") && open === true && (
          <View style={themed($formCard)}>
            {error && (
              <View style={themed($errorContainer)}>
                <Text text={error} style={themed($errorText)} />
              </View>
            )}
            {children}
            <View style={themed($formActions)}>
              <Button
                text="Cancel"
                onPress={handleCancel}
                style={themed($cancelButton)}
                textStyle={themed($cancelButtonText)}
              />
              <Button
                text="Save"
                onPress={handleSuccess}
                style={themed($saveButton)}
                textStyle={themed($saveButtonText)}
                disabled={saveDisabled}
              />
            </View>
          </View>
        ))}
    </View>
  )
}

const $section: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xl,
  zIndex: 100,
  elevation: 5,
})

const $sectionHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.md,
})

const $sectionTitle: ThemedStyle<any> = ({ colors, spacing, typography }) => ({
  fontSize: 18,
  fontFamily: typography.primary.bold,
  marginBottom: spacing.md,
  color: colors.text,
})

const $addButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.tint,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
})

const $addButtonText: ThemedStyle<any> = ({ colors }) => ({
  color: colors.background,
  fontSize: 14,
})

const $formCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  padding: spacing.lg,
  borderRadius: spacing.sm,
  borderWidth: 1,
  borderColor: colors.border,
})

const $formActions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.md,
  marginTop: spacing.sm,
})

const $cancelButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral400,
  flex: 1,
})

const $cancelButtonText: ThemedStyle<any> = ({ colors }) => ({
  color: colors.background,
})

const $saveButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.tint,
  flex: 1,
})

const $saveButtonText: ThemedStyle<any> = ({ colors }) => ({
  color: colors.background,
})

const $errorContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.error + "20", // 20% opacity
  borderColor: colors.error,
  borderWidth: 1,
  borderRadius: spacing.xs,
  padding: spacing.sm,
  marginBottom: spacing.md,
})

const $errorText: ThemedStyle<any> = ({ colors, typography }) => ({
  color: colors.error,
  fontSize: 14,
  fontFamily: typography.primary.medium,
  textAlign: "center",
})
