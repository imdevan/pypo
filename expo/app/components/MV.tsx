import { forwardRef, ForwardedRef } from "react"
import { ViewStyle, StyleProp } from "react-native"
import { MotiView } from "moti"

import { useAppTheme } from "@/theme/context"
import type { ThemedStyle, ThemedStyleArray } from "@/theme/types"

type Presets = "default" 

export interface MVProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  /**
   * One of the different types of text presets.
   */
  preset?: Presets
  /**
   * Children components
   */
  children?: React.ReactNode
  /**
   * Animation properties
   */
  from?: any
  animate?: any
  transition?: any
  exit?: any
  [key: string]: any
}

export const MV = forwardRef(function MV({style: $styleOverride, preset="default", ...rest }: MVProps, ref: ForwardedRef<any>) {
  const { themed } = useAppTheme()

  const $styles: StyleProp<ViewStyle> = [
    themed($presets[preset]),
    $styleOverride,
  ]

  return (
    <MotiView {...rest} style={$styles} ref={ref} />
  )
})

const $baseStyle: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.background,
})

const $presets: Record<Presets, ThemedStyleArray<ViewStyle>> = {
  default: [$baseStyle],
} 