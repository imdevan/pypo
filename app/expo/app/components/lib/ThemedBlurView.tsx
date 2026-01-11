import { ReactNode } from "react"
import { Platform, StyleProp, ViewStyle } from "react-native"
import { BlurView } from "expo-blur"

import { useAppTheme } from "@/theme/context"

export interface ThemedBlurViewProps {
  /**
   * Children to render inside the BlurView
   */
  children?: ReactNode
  /**
   * Style to apply to the BlurView
   */
  style?: StyleProp<ViewStyle>
}

/**
 * A themed BlurView component that automatically applies the correct tint
 * based on the current theme (light/dark).
 * Uses systemThinMaterialDark for dark theme and systemThinMaterialLight for light theme.
 */
export function ThemedBlurView({ children, style }: ThemedBlurViewProps) {
  const {
    theme: { isDark },
  } = useAppTheme()

  if (Platform.OS === "web") {
    // On web, BlurView doesn't work, so just render children in a View
    return <>{children}</>
  }

  return (
    <BlurView
      intensity={100}
      tint={isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
      style={style}
    >
      {children}
    </BlurView>
  )
}
