import { ViewStyle, TextStyle } from "react-native"

import { ThemedStyle, ThemedStyleArray } from "./types"

export type Styles = Record<string, ThemedStyle<ViewStyle> | ThemedStyle<TextStyle> | ViewStyle | TextStyle>

/* Use this file to define styles that are used in multiple places in your app. */
export const $styles: Styles = {
  row: { flexDirection: "row" } as ViewStyle,
  flex1: { flex: 1 } as ViewStyle,
  flexWrap: { flexWrap: "wrap" } as ViewStyle,

  container: ({spacing, width}) => ({
    paddingHorizontal: spacing.lg,
    width: width > 1200 ? 800 : width > 600 ? width - spacing.lg : width - spacing.sm,
    margin: "auto",
    flex: 1,
  }),

  toggleInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  } as ViewStyle,

  mutedText: ({colors}) => ({
    color: colors.textDim
  })
}
