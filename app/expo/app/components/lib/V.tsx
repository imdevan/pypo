import { forwardRef, ForwardedRef } from "react"
// eslint-disable-next-line no-restricted-imports
import { View as RNView, ViewProps as RNViewProps, ViewStyle, StyleProp } from "react-native"

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

export const V = forwardRef(function V(
  { style: $styleOverride, preset = "default", ...rest }: VProps,
  ref: ForwardedRef<RNView>,
) {
  const { themed } = useAppTheme()

  const $styles: StyleProp<ViewStyle> = [themed($presets[preset]), $styleOverride]

  return <RNView {...rest} style={$styles} ref={ref} />
})

const $baseStyle: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.background,
})

const $presets: Record<Presets, ThemedStyleArray<ViewStyle>> = {
  default: [$baseStyle],
}
