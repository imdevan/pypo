import { ReactNode } from "react"
import { Platform, View, ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Screen, ScreenProps } from "@/components/lib/Screen"
import { ThemedBlurView } from "@/components/lib/ThemedBlurView"
import { DrawerIconButton } from "@/screens/DemoShowroomScreen/DrawerIconButton"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"

export interface ScreenWithHeaderProps extends Omit<ScreenProps, "children"> {
  /**
   * Header component to render at the top of the screen
   */
  headerComponent?: ReactNode
  /**
   * Children components to render below the header
   */
  children?: ReactNode
  /**
   * Callback for drawer toggle action
   */
  onDrawerToggle?: () => void
}

/**
 * A Screen component with an optional header component.
 * Combines the standard Screen with a header pattern commonly used throughout the app.
 */
export function ScreenWithHeader(props: ScreenWithHeaderProps) {
  const { headerComponent, onDrawerToggle, children, ...screenProps } = props
  const { themed } = useAppTheme()
  const { top } = useSafeAreaInsets()
  const isAndroid = Platform.OS === "android"

  return (
    <Screen
      preset="fixed"
      contentContainerStyle={themed($styles.flex1)}
      safeAreaEdges={[]}
      {...(isAndroid ? { KeyboardAvoidingViewProps: { behavior: undefined } } : {})}
      {...screenProps}
    >
      {(headerComponent || onDrawerToggle) && (
        <View style={themed($headerContainer)}>
          {Platform.OS !== "web" ? (
            <ThemedBlurView style={themed($headerBlur)}>
              <View style={[themed($headerContentOverlay), { paddingTop: top }]}>
                <View style={themed($headerContent)}>
                  {headerComponent ||
                    (onDrawerToggle && <DrawerIconButton onPress={onDrawerToggle} />)}
                </View>
              </View>
            </ThemedBlurView>
          ) : (
            <View style={[themed($headerContentWithBg), { paddingTop: top }]}>
              {headerComponent || (onDrawerToggle && <DrawerIconButton onPress={onDrawerToggle} />)}
            </View>
          )}
        </View>
      )}
      <View style={themed($contentWrapper)}>{children}</View>
    </Screen>
  )
}

const $headerContainer: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  elevation: 1000,
  overflow: "hidden",
  margin: 0,
  borderWidth: 0,
})

const $headerBlur: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  height: "100%",
  margin: 0,
  borderWidth: 0,
})

const $headerContentOverlay: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  // backgroundColor: colors.background,
  backgroundColor: "rgba(0,0,0,0)",
  opacity: 1,
  margin: 0,
  borderWidth: 0,
})

const $headerContent: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  // paddingTop: spacing.sm,
  // paddingBottom: spacing.sm,
})

const $headerContentWithBg: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: "100%",
  paddingTop: spacing.sm,
  paddingBottom: spacing.sm,
  backgroundColor: colors.background,
  // colors is used above
})

const $contentWrapper: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  // paddingTop will be set dynamically to account for header (56px button + 12px top + 12px bottom = 80px) + safe area
})
