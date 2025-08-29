const palette = {
  // Neutrals (light-first, layered for backgrounds and borders)
  neutral100: "#FFFFFF", // pure white
  neutral200: "#F9F9F9", // main background
  neutral300: "#F0F0F0", // secondary background
  neutral400: "#D9D9D9", // light border
  neutral500: "#A3A3A3", // mid-gray text
  neutral600: "#737373", // body text
  neutral700: "#525252", // strong text
  neutral800: "#2E2E2E", // headers
  neutral900: "#121212", // darkest

  // Primary (warm orange/peach — same family as dark mode)
  primary100: "#FFF1EB",
  primary200: "#FFD8C7",
  primary300: "#FFBFA3",
  primary400: "#FF9D7C",
  primary500: "#F26D50",
  primary600: "#C94E32",

  // Secondary (cool balance with indigo/blue)
  secondary100: "#F2F3FA",
  secondary200: "#E1E4F2",
  secondary300: "#C4C8E8",
  secondary400: "#9CA2D9",
  secondary500: "#6A72B8",

  // Accent (cheerful golden yellow)
  accent100: "#FFFBE6",
  accent200: "#FFF3BF",
  accent300: "#FFE066",
  accent400: "#FFD43B",
  accent500: "#FCC419",

  // Angry (alerts/errors)
  angry100: "#FEE3E1",
  angry500: "#E03131",

  // Overlays
  overlay20: "rgba(255, 255, 255, 0.2)",
  overlay50: "rgba(255, 255, 255, 0.5)",
} as const

export const colors = {
  /**
   * The palette is available to use, but prefer using the name.
   * This is only included for rare, one-off cases. Try to use
   * semantic names as much as possible.
   */
  palette,
  /**
   * A helper for making something see-thru.
   */
  transparent: "rgba(0, 0, 0, 0)",
  /**
   * The default text color in many components.
   */
  text: palette.neutral800,
  /**
   * Secondary text information.
   */
  textDim: palette.neutral600,
  /**
   * The default color of the screen background.
   */
  background: palette.neutral200,
  /**
   * The default border color.
   */
  border: palette.neutral400,
  /**
   * The main tinting color.
   */
  tint: palette.primary500,
  /**
   * The inactive tinting color.
   */
  tintInactive: palette.neutral300,
  /**
   * A subtle color used for lines.
   */
  separator: palette.neutral300,
  /**
   * Error messages.
   */
  error: palette.angry500,
  /**
   * Error Background.
   */
  errorBackground: palette.angry100,
} as const
