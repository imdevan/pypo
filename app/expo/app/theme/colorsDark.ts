const palette = {
  // Neutrals (foundation, layered like Notion/GitHub)
  neutral900: "#FFFFFF",
  neutral800: "#F5F5F5",
  neutral700: "#D1D1D1",
  neutral600: "#A1A1A1",
  neutral500: "#737373",
  neutral400: "#525252",
  neutral300: "#2E2E2E",
  neutral200: "#1E1E1E", // main app background
  neutral100: "#121212", // pure dark base

  // Primary (warm, but muted — approachable and “dance studio” vibe)
  primary100: "#FFE5D9",
  primary200: "#FFCAB5",
  primary300: "#FF9F80",
  primary400: "#FF7A5C",
  primary500: "#E85A3C",
  primary600: "#C13F27",

  // Secondary (cool balance, leaning toward Notion grays + hint of indigo)
  secondary100: "#E1E4F2",
  secondary200: "#C4C8E8",
  secondary300: "#9CA2D9",
  secondary400: "#6A72B8",
  secondary500: "#474C8C",

  // Accent (friendly pop colors, softer than Google’s Material)
  accent100: "#FFF4CC",
  accent200: "#FFE799",
  accent300: "#FFD966",
  accent400: "#FFCA33",
  accent500: "#FFB700",

  // Angry (alerts/errors)
  angry100: "#FDD8D6",
  angry500: "#D64545",

  // Overlays
  overlay20: "rgba(18, 18, 18, 0.2)",
  overlay50: "rgba(18, 18, 18, 0.5)",
} as const

export const colors = {
  palette,
  transparent: "rgba(0, 0, 0, 0)",
  text: palette.neutral800,
  textDim: palette.neutral600,
  background: palette.neutral200,
  border: palette.neutral400,
  tint: palette.primary500,
  tintInactive: palette.neutral600,
  separator: palette.neutral300,
  error: palette.angry500,
  errorBackground: palette.angry100,
} as const
