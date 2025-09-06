import React, { useState } from "react"
import { View } from "react-native"
import DropDownPicker from "react-native-dropdown-picker"

import { colors } from "@/theme/colors"
import { useAppTheme } from "@/theme/context"

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
}

export type DropDownBaseProps = DropDownSingleProps | DropDownMultipleProps

export interface DropDownSingleControlledProps extends DropDownSingleProps {
  open: boolean
  setOpen: (value: any) => void
}

export interface DropDownMultipleControlledProps extends DropDownMultipleProps {
  open: boolean
  setOpen: (value: any) => void
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
}: DropDownBaseProps) {
  const { themed } = useAppTheme()
  const [open, setOpen] = useState(false)

  return (
    <View style={themed($dropdownContainer)}>
      {label && <Text text={label} preset="formLabel" style={themed($dropdownLabel)} />}
      {/* @ts-ignore - react-native-dropdown-picker has complex discriminated union types */}
      <DropDownPicker
        items={items}
        multiple={multiple}
        value={value}
        setValue={setValue as any}
        open={open}
        setOpen={setOpen}
        placeholder={placeholder}
        loading={loading}
        style={themed($dropdownStyle)}
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
}: DropDownProps) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($dropdownContainer)}>
      {label && <Text text={label} preset="formLabel" style={themed($dropdownLabel)} />}
      {/* @ts-ignore - react-native-dropdown-picker has complex discriminated union types */}
      <DropDownPicker
        items={items}
        multiple={multiple}
        value={value}
        setValue={setValue as any}
        open={open}
        setOpen={setOpen}
        placeholder={placeholder}
        loading={loading}
        style={themed($dropdownStyle)}
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

const $dropdownLabel = {
  marginBottom: 8,
}

const $dropdownStyle = {
  backgroundColor: colors.background,
  borderColor: colors.border,
  borderWidth: 1,
  borderRadius: 8,
  minHeight: 50,
  zIndex: 100,
  elevation: 5,
}

const $dropdownListStyle = {
  backgroundColor: colors.background,
  borderColor: colors.border,
  borderWidth: 1,
  borderRadius: 8,
  zIndex: 100,
  elevation: 5,
}

const $dropdownTextStyle = {
  fontSize: 16,
  color: colors.text,
}

const $dropdownPlaceholderStyle = {
  color: colors.textDim,
  fontSize: 16,
}

const $dropdownLabelStyle = {
  fontSize: 16,
  color: colors.text,
}

const $dropdownSelectedItemStyle = {
  backgroundColor: colors.palette.primary100,
}
