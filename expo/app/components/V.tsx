import { ReactNode, forwardRef, ForwardedRef } from "react"
// eslint-disable-next-line no-restricted-imports
import { StyleProp, Text as RNText, TextProps as RNTextProps, TextStyle } from "react-native"
import { View as RNView, ViewProps as RNViewProps, ViewStyle } from "react-native"

import { useAppTheme } from "@/theme/context"
import type { ThemedStyle, ThemedStyleArray } from "@/theme/types"

type Presets = "default" 

export interface VProps extends RNViewProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  /**
   * One of the different types of text presets.
   */
  preset?: Presets
}

export const V = forwardRef(function Text({style: $styleOverride, preset="default", ...rest }: VProps, ref: ForwardedRef<RNText>) {
  const { themed } = useAppTheme()

  const $styles: StyleProp<ViewStyle> = [
    themed($presets[preset]),
    $styleOverride,
  ]

  return (
    <RNView {...rest} style={$styles} ref={ref} />
  )
})

const $baseStyle: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.text,
})

const $presets: Record<Presets, ThemedStyleArray<TextStyle>> = {
  default: [$baseStyle],
}