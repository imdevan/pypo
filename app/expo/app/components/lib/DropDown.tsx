import { useState } from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import DropDownPicker from "react-native-dropdown-picker"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

import { Text } from "./Text"

export interface DropDownOption {
  label: string
  value: string
}

export interface DropDownSingleProps {
  label?: string
  items: DropDownOption[]
  multiple?: false
  value: string | null
  setValue: (value: string | null) => void
  placeholder?: string
  loading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  closeAfterSelecting?: boolean
  maxHeight?: number
  zIndex?: number
  zIndexInverse?: number
  badgeColors?: string[] | undefined
}

export interface DropDownMultipleProps {
  label?: string
  items: DropDownOption[]
  multiple: true
  value: string[] | null
  setValue: (value: string[] | null) => void
  placeholder?: string
  loading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  closeAfterSelecting?: boolean
  maxHeight?: number
  zIndex?: number
  zIndexInverse?: number
  badgeColors?: string[] | undefined
}

export type DropDownBaseProps = DropDownSingleProps | DropDownMultipleProps

export interface DropDownSingleControlledProps extends DropDownSingleProps {
  open: boolean
  setOpen: (value: any) => void
  onClose?: () => void
}

export interface DropDownMultipleControlledProps extends DropDownMultipleProps {
  open: boolean
  setOpen: (value: any) => void
  onClose?: () => void
}

export type DropDownProps = DropDownSingleControlledProps | DropDownMultipleControlledProps

// Component with internal state management (default) - no open/setOpen props needed
export function DropDown(props: DropDownSingleProps): React.ReactElement
export function DropDown(props: DropDownMultipleProps): React.ReactElement
export function DropDown({
  label,
  items,
  multiple = false,
  value,
  setValue,
  placeholder = "Select...",
  loading = false,
  searchable = false,
  searchPlaceholder = "Search...",
  closeAfterSelecting = true,
  maxHeight = 200,
  zIndex = 100,
  zIndexInverse = 1000,
  badgeColors,
}: DropDownBaseProps) {
  const { theme, themed } = useAppTheme()
  const [open, setOpen] = useState(false)

  return (
    <View style={themed($dropdownContainer)}>
      {label && <Text text={label} preset="formLabel" style={themed($dropdownLabel)} />}
      {/* @ts-ignore - react-native-dropdown-picker has complex discriminated union types */}
      <DropDownPicker
        theme={theme.isDark ? "DARK" : "LIGHT"}
        mode="BADGE"
        showBadgeDot={false}
        items={items}
        multiple={multiple}
        value={value}
        setValue={setValue as any}
        open={open}
        setOpen={setOpen}
        onClose={() => setOpen(false)}
        placeholder={placeholder}
        loading={loading}
        style={themed($dropdownStyle)}
        badgeColors={badgeColors}
        dropDownContainerStyle={themed($dropdownListStyle)}
        textStyle={themed($dropdownTextStyle)}
        placeholderStyle={themed($dropdownPlaceholderStyle)}
        labelStyle={themed($dropdownLabelStyle)}
        selectedItemContainerStyle={themed($dropdownSelectedItemStyle)}
        closeAfterSelecting={closeAfterSelecting}
        zIndex={zIndex}
        zIndexInverse={zIndexInverse}
        maxHeight={maxHeight}
        listMode="SCROLLVIEW"
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
      />
    </View>
  )
}

// Component with external state management (for advanced use cases)
export function DropDownControlled(props: DropDownSingleControlledProps): React.ReactElement
export function DropDownControlled(props: DropDownMultipleControlledProps): React.ReactElement
export function DropDownControlled({
  label,
  items,
  multiple = false,
  value,
  setValue,
  open,
  setOpen,
  placeholder = "Select...",
  loading = false,
  searchable = false,
  searchPlaceholder = "Search...",
  closeAfterSelecting = true,
  maxHeight = 200,
  zIndex = 100,
  zIndexInverse = 1000,
  onClose,
}: DropDownProps) {
  const { theme, themed } = useAppTheme()

  const handleClose = () => {
    setOpen(false)
    onClose?.()
  }

  return (
    <View style={themed($dropdownContainer)}>
      {label && <Text text={label} preset="formLabel" style={themed($dropdownLabel)} />}
      {/* @ts-ignore - react-native-dropdown-picker has complex discriminated union types */}
      <DropDownPicker
        theme={theme.isDark ? "DARK" : "LIGHT"}
        mode="BADGE"
        showBadgeDot={false}
        items={items}
        multiple={multiple}
        value={value}
        setValue={setValue as any}
        open={open}
        setOpen={setOpen}
        onClose={handleClose}
        placeholder={placeholder}
        loading={loading}
        style={themed($dropdownStyle)}
        badgeColors={multiple ? theme.colors.tint : undefined}
        dropDownContainerStyle={themed($dropdownListStyle)}
        textStyle={themed($dropdownTextStyle)}
        placeholderStyle={themed($dropdownPlaceholderStyle)}
        labelStyle={themed($dropdownLabelStyle)}
        selectedItemContainerStyle={themed($dropdownSelectedItemStyle)}
        closeAfterSelecting={closeAfterSelecting}
        zIndex={zIndex}
        zIndexInverse={zIndexInverse}
        maxHeight={maxHeight}
        listMode="SCROLLVIEW"
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
      />
    </View>
  )
}

const $dropdownContainer = {
  marginBottom: 12,
  position: "relative" as const,
  zIndex: 100,
  elevation: 5,
}

const $dropdownLabel: ThemedStyle<ViewStyle> = ({ colors }) => ({
  color: colors.text,
  marginBottom: 8,
})

const $dropdownStyle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  borderColor: colors.border,
  borderWidth: 1,
  borderRadius: 8,
  minHeight: 50,
  zIndex: 100,
  elevation: 5,
})

const $dropdownListStyle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  borderColor: colors.border,
  borderWidth: 1,
  borderRadius: 8,
  zIndex: 100,
  elevation: 5,
})

const $dropdownTextStyle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 16,
})

const $dropdownPlaceholderStyle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 16,
})

const $dropdownLabelStyle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 16,
})

const $dropdownSelectedItemStyle: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.isDark ? theme.colors.palette.neutral300 : theme.colors.tint,
})
