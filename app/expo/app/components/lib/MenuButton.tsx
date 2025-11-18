import { Pressable, PressableProps, ViewStyle } from "react-native"

import { Icon } from "@/components/lib/Icon"
import { useAppTheme } from "@/theme/context"

interface MenuButtonProps extends PressableProps {
  onPress: () => void
}

/**
 * A simple menu button that can be used to open a drawer
 * @param {MenuButtonProps} props - The props for the `MenuButton` component.
 * @returns {JSX.Element} The rendered `MenuButton` component.
 */
export function MenuButton(props: MenuButtonProps) {
  const { onPress, ...pressableProps } = props
  const { theme } = useAppTheme()

  return (
    <Pressable
      onPress={onPress}
      style={[$container, { backgroundColor: theme.colors.background }]}
      {...pressableProps}
    >
      <Icon icon="menu" size={24} color={theme.colors.text} />
    </Pressable>
  )
}

const $container: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  height: 44,
  width: 44,
  borderRadius: 22,
}
