import { FC, useCallback, useEffect, useRef, useState } from "react"
import type { StyleProp, TextStyle, ViewStyle } from "react-native"
import { Pressable, View } from "react-native"
// eslint-disable-next-line no-restricted-imports
import { TextInput } from "react-native"

import { Text, TextProps } from "@/components/lib/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export interface EditableTextProps {
  /**
   * The initial text value to display
   */
  value: string
  /**
   * Callback called when the text is saved (on blur or enter)
   * @param newValue - The new text value
   */
  onSave: (newValue: string) => void | Promise<void>
  /**
   * Optional callback called when editing is cancelled
   */
  onCancel?: () => void
  /**
   * Text preset to use for display (default: "default")
   */
  preset?: TextProps["preset"]
  /**
   * Style for the text container when not editing
   */
  textStyle?: StyleProp<ViewStyle>
  /**
   * Style for the text input when editing
   */
  inputStyle?: StyleProp<TextStyle>
  /**
   * Style for the input container when editing
   */
  inputContainerStyle?: StyleProp<ViewStyle>
  /**
   * Whether the text is editable (default: true)
   */
  editable?: boolean
  /**
   * Placeholder text for the input
   */
  placeholder?: string
  /**
   * Whether to select all text on focus (default: true)
   */
  selectTextOnFocus?: boolean
  /**
   * Whether to auto-focus when entering edit mode (default: true)
   */
  autoFocus?: boolean
  /**
   * Additional props to pass to the TextInput
   */
  textInputProps?: Omit<
    React.ComponentProps<typeof TextInput>,
    "value" | "onChangeText" | "onBlur" | "onSubmitEditing" | "style" | "ref"
  >
}

/**
 * A component that displays text that can be clicked to edit inline.
 * The text switches to a TextInput when clicked, and saves on blur or enter.
 */
export const EditableText: FC<EditableTextProps> = ({
  value,
  onSave,
  onCancel,
  preset = "default",
  textStyle,
  inputStyle,
  inputContainerStyle,
  editable = true,
  placeholder,
  selectTextOnFocus = true,
  autoFocus = true,
  textInputProps,
}) => {
  const { themed } = useAppTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [editedValue, setEditedValue] = useState(value)
  const inputRef = useRef<TextInput>(null)

  // Update edited value when value prop changes (but not while editing)
  useEffect(() => {
    if (!isEditing) {
      setEditedValue(value)
    }
  }, [value, isEditing])

  const handlePress = useCallback(() => {
    if (editable) {
      setEditedValue(value)
      setIsEditing(true)
      // Focus the input after a short delay to ensure it's rendered
      if (autoFocus) {
        setTimeout(() => {
          inputRef.current?.focus()
        }, 100)
      }
    }
  }, [editable, value, autoFocus])

  const handleSave = useCallback(async () => {
    if (!editable) {
      setIsEditing(false)
      return
    }

    const trimmedValue = editedValue.trim()

    // If value is empty, restore original and exit edit mode
    if (!trimmedValue) {
      setEditedValue(value)
      setIsEditing(false)
      onCancel?.()
      return
    }

    // Only save if the value actually changed
    if (trimmedValue !== value) {
      try {
        await onSave(trimmedValue)
        setEditedValue(trimmedValue)
      } catch {
        // Reset to original value on error
        setEditedValue(value)
      }
    }

    setIsEditing(false)
  }, [editable, editedValue, value, onSave, onCancel])

  if (isEditing) {
    return (
      <View style={[themed($defaultInputContainer), inputContainerStyle]}>
        <TextInput
          ref={inputRef}
          value={editedValue}
          onChangeText={setEditedValue}
          onBlur={handleSave}
          onSubmitEditing={handleSave}
          style={[themed($defaultInput), inputStyle]}
          placeholder={placeholder}
          selectTextOnFocus={selectTextOnFocus}
          autoFocus={autoFocus}
          {...textInputProps}
        />
      </View>
    )
  }

  return (
    <Pressable onPress={handlePress} disabled={!editable}>
      <Text text={value} preset={preset} style={textStyle} />
    </Pressable>
  )
}

const $defaultInputContainer: ThemedStyle<ViewStyle> = () => ({})

const $defaultInput: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  fontSize: 16, // Default size, can be overridden via inputStyle prop
  fontFamily: typography?.primary?.normal || undefined,
  color: colors.text,
  padding: spacing.xs,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 4,
  backgroundColor: colors.background,
})
