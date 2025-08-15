import { ReactNode, forwardRef, ForwardedRef } from "react"
// eslint-disable-next-line no-restricted-imports
import { StyleProp, Text as RNText, TextProps as RNTextProps, TextStyle } from "react-native"
import { View as RNView, ViewProps as RNViewProps, ViewStyle } from "react-native"

import { useAppTheme } from "@/theme/context"
import type { ThemedStyle, ThemedStyleArray } from "@/theme/types"
import { V, VProps } from "./V"
import { DebugMode, useDebugStore } from "@/stores/debugStore"

type Presets = "default" 

export interface DVProps extends VProps {
  debugLevel?: DebugMode
}

/**
 * Debug View
 * A view that only renders if the debug mode is enabled.
 * @param props - The props for the DebugView component.
 * @param ref - The ref for the DebugView component.
 * @returns The DebugView component.
 */
export const DebugView = forwardRef(function DebugView({debugLevel = DebugMode.BASIC, ...props}: DVProps, ref: ForwardedRef<RNView>) {
  const {debugMode, isDebugEnabled} = useDebugStore();

  if (!isDebugEnabled()) {
    return null;
  }

  return <View {...props} ref={ref} />
})
