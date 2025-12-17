import React, { useState } from "react"
import { View, ViewStyle, StyleProp } from "react-native"
import ReanimatedColorPicker, {
  Panel1,
  Preview,
  HueSlider,
  OpacitySlider,
  Swatches,
} from "reanimated-color-picker"

import { useAppTheme } from "@/theme/context"
import { spacing } from "@/theme/spacing"
import type { ThemedStyle } from "@/theme/types"

import { Button } from "./Button"
import { Text } from "./Text"

interface ColorPickerProps {
  value: string
  onColorChange: (color: string) => void
  label?: string
  style?: StyleProp<ViewStyle>
  showOpacitySlider?: boolean
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onColorChange,
  label,
  style,
  showOpacitySlider = false,
}) => {
  const { themed } = useAppTheme()
  const [showPicker, setShowPicker] = useState(false)

  const handleColorChange = (color: { hex: string }) => {
    onColorChange(color.hex)
  }

  const handleConfirm = () => {
    setShowPicker(false)
  }

  const handleCancel = () => {
    setShowPicker(false)
  }

  return (
    <View style={[themed($container), style]}>
      {label && <Text text={label} preset="formLabel" style={themed($label)} />}

      <View style={themed($colorPreviewContainer)}>
        <View style={[themed($colorPreview), { backgroundColor: value }]} />
        <Button
          text="Choose Color"
          preset="default"
          onPress={() => setShowPicker(true)}
          style={themed($button)}
        />
      </View>

      {showPicker && (
        <View style={themed($pickerContainer)}>
          <ReanimatedColorPicker
            value={value}
            onComplete={handleColorChange}
            style={themed($picker)}
          >
            <Preview />
            <Panel1 />
            <HueSlider style={themed($hueSlider)} />
            {showOpacitySlider && <OpacitySlider />}
            <Swatches />
          </ReanimatedColorPicker>
          <View style={themed($pickerActions)}>
            <Button
              text="Cancel"
              preset="default"
              onPress={handleCancel}
              style={themed($cancelButton)}
            />
            <Button
              text="Confirm"
              preset="default"
              onPress={handleConfirm}
              style={themed($confirmButton)}
            />
          </View>
        </View>
      )}
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $label: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
})

const $colorPreviewContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
})

const $colorPreview: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: 40,
  height: 40,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: "#ccc",
})

const $button: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
})

const $pickerContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderRadius: 12,
  padding: spacing.lg,
  marginTop: spacing.md,
  borderWidth: 1,
  borderColor: colors.border,
  maxWidth: 384, // 24rem
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
})

const $hueSlider: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $picker: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $pickerActions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
})

const $cancelButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral400,
  flex: 1,
})

const $confirmButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
  flex: 1,
})
