/** 
 * This file is here to deal with the styling needed for react-native-alert
 * todo: replace react-native-alert with custom solution
 * https://github.com/blazejkustra/react-native-alert
 * 
 * From the docs for convience: 
 * 
 * --rn-alert-bg – dialog background
 * --rn-alert-fg – primary text color
 * --rn-alert-muted – secondary / muted text
 * --rn-alert-surface – input & surface background
 * --rn-alert-border – border color
 * --rn-alert-elev – box shadow / elevation
 * --rn-alert-accent – primary button color
 * --rn-alert-accent-hover – primary button hover color
 * --rn-alert-danger – destructive button color
 * --rn-alert-danger-hover – destructive button hover color
 * --rn-alert-radius – border radius (dialogs/buttons)
 * --rn-alert-radius-sm – small border radius (inputs/buttons)
 * --rn-alert-spacing – default padding
 * --rn-alert-spacing-sm – small padding
 * --rn-alert-btn-min – minimum button height (touch target)
 * --rn-alert-outline – focus outline style
 * --rn-alert-outline-weak – subtle focus outline
 * --rn-alert-font – font family
 * --rn-alert-font-size – base font size
 * --rn-alert-title-size – title font size
 */
import {
  createContext,
  FC,
  PropsWithChildren,
  useEffect,
} from "react"
import { Platform } from "react-native"

import { useAppTheme } from "@/theme/context"
export type AlertContextType = {}

export const AlertContext = createContext<AlertContextType | null>(null)

export interface AlertProviderProps {}

export const AlertProvider: FC<PropsWithChildren<AlertProviderProps>> = ({ children }) => {
   const {theme: {colors}} = useAppTheme()

  useEffect(() => {
    if (Platform.OS === "web") {
      console.log('called!')
      const style = document.createElement("style")
      style.textContent = `
        :root {
          --rn-alert-accent: ${colors.tint} !important;
          --rn-alert-danger: ${colors.error} !important;
          --rn-alert-bg: ${colors.background} !important;
          --rn-alert-fg: ${colors.text} !important;
          --rn-alert-muted: ${colors.textDim} !important;
          --rn-alert-surface: ${colors.background} !important;
          --rn-alert-border: ${colors.border} !important;
          --rn-alert-accent: ${colors.tint} !important;
          --rn-alert-accent-hover: ${colors.tint} !important;
          --rn-alert-danger: ${colors.error} !important;
          --rn-alert-danger-hover: ${colors.error} !important;
        }
      `
      document.body.appendChild(style)
    }
  }, [colors])

  return <>{children}</>
}

