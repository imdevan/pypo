import { ReactNode } from "react"
import { Platform } from "react-native"

import { Screen, ScreenProps } from "@/components/lib/Screen"
import { $styles } from "@/theme/styles"
import { DrawerIconButton } from "@/screens/DemoShowroomScreen/DrawerIconButton"

export interface ScreenWithHeaderProps extends Omit<ScreenProps, 'children'> {
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
  const isAndroid = Platform.OS === "android"

  return (
    <Screen
      preset="fixed"
      contentContainerStyle={$styles.flex1}
      safeAreaEdges={["top"]}
      {...(isAndroid ? { KeyboardAvoidingViewProps: { behavior: undefined } } : {})}
      {...screenProps}
    >
      {headerComponent || (onDrawerToggle && <DrawerIconButton onPress={onDrawerToggle} />)}
      {children}
    </Screen>
  )
}
