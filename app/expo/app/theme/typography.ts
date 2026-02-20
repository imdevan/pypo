// TODO: write documentation about fonts and typography along with guides on how to add custom fonts in own
// markdown file and add links from here

import {
  BeVietnamPro_300Light as beVietnamProLight,
  BeVietnamPro_400Regular as beVietnamProRegular,
  BeVietnamPro_500Medium as beVietnamProMedium,
  BeVietnamPro_600SemiBold as beVietnamProSemiBold,
  BeVietnamPro_700Bold as beVietnamProBold,
} from "@expo-google-fonts/be-vietnam-pro"
import {
  FiraCode_300Light as firaCodeLight,
  FiraCode_400Regular as firaCodeRegular,
  FiraCode_500Medium as firaCodeMedium,
  FiraCode_600SemiBold as firaCodeSemiBold,
  FiraCode_700Bold as firaCodeBold,
} from "@expo-google-fonts/fira-code"
import {
  RedHatDisplay_300Light as redHatDisplayLight,
  RedHatDisplay_400Regular as redHatDisplayRegular,
  RedHatDisplay_500Medium as redHatDisplayMedium,
  RedHatDisplay_600SemiBold as redHatDisplaySemiBold,
  RedHatDisplay_700Bold as redHatDisplayBold,
} from "@expo-google-fonts/red-hat-display"

export const customFontsToLoad = {
  redHatDisplayLight,
  redHatDisplayRegular,
  redHatDisplayMedium,
  redHatDisplaySemiBold,
  redHatDisplayBold,
  beVietnamProLight,
  beVietnamProRegular,
  beVietnamProMedium,
  beVietnamProSemiBold,
  beVietnamProBold,
  firaCodeLight,
  firaCodeRegular,
  firaCodeMedium,
  firaCodeSemiBold,
  firaCodeBold,
}

const fonts = {
  redHatDisplay: {
    // Cross-platform Google font.
    light: "redHatDisplayLight",
    normal: "redHatDisplayRegular",
    medium: "redHatDisplayMedium",
    semiBold: "redHatDisplaySemiBold",
    bold: "redHatDisplayBold",
  },
  beVietnamPro: {
    // Cross-platform Google font.
    light: "beVietnamProLight",
    normal: "beVietnamProRegular",
    medium: "beVietnamProMedium",
    semiBold: "beVietnamProSemiBold",
    bold: "beVietnamProBold",
  },
  firaCode: {
    // Cross-platform Google font for code.
    light: "firaCodeLight",
    normal: "firaCodeRegular",
    medium: "firaCodeMedium",
    semiBold: "firaCodeSemiBold",
    bold: "firaCodeBold",
  },
}

export const typography = {
  /**
   * The fonts are available to use, but prefer using the semantic name.
   */
  fonts,
  /**
   * The primary font. Used in most places.
   */
  primary: fonts.redHatDisplay,
  /**
   * An alternate font used for perhaps titles and stuff.
   */
  secondary: fonts.beVietnamPro,
  /**
   * Lets get fancy with a monospace font!
   */
  code: fonts.firaCode,
}
