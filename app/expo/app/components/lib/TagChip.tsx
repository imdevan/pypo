import { FC } from "react"
import { TextStyle, View, ViewStyle } from "react-native"

import type { TagPublic } from "@/client/types.gen"
import { Text } from "@/components/lib/Text"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

interface TagChipProps {
  tag: TagPublic
  variant?: "outline" | "solid"
}

export const TagChip: FC<TagChipProps> = ({ tag, variant = "outline" }) => {
  const { themed } = useAppTheme()

  return (
    <View key={tag.id} style={themed(variant === "solid" ? $tagChipSolid : $tagChip)}>
      <Text text={tag.name} style={themed(variant === "solid" ? $tagTextSolid : $tagText)} />
    </View>
  )
}

const $tagChip: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  borderColor: colors.border,
  borderWidth: 1,
  borderRadius: 4,
  paddingHorizontal: 8,
  paddingVertical: 4,
})

const $tagChipSolid: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.text,
  borderColor: colors.text,
  borderWidth: 1,
  borderRadius: 4,
  paddingHorizontal: 8,
  paddingVertical: 4,
})

const $tagText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $tagTextSolid: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
})
