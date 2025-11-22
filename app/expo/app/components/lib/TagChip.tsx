import { FC, useMemo } from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import type { TagPublic } from "@/client/types.gen"
import { Text } from "@/components/lib/Text"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { luminance } from "@/utils/luminance"

interface TagChipProps {
  tag: TagPublic
}

export const TagChip: FC<TagChipProps> = ({ tag }) => {
  const { themed, theme } = useAppTheme()
  console.log('theme:', theme);

  const lumi = luminance(tag.color);
  const { neutral200, neutral800 } = theme.colors.palette;

  console.log('lumi:', lumi);

  // Theme is dark; lumi is high = p200
  // Theme | lumi | color
  // dark  | high | p200
  // light | high | p800
  // dark  | low  | p800
  // light | high | p200
  const textColor = useMemo(() => {
    return theme.isDark ? lumi > 0.5 ? neutral200 : neutral800 :
      lumi > 0.5 ? neutral800 : neutral200;
  }, [tag.color, theme.isDark])

  // Theme is light; lumi is high = p800
  //
  // const textColor = lumi > 0.5 ? theme.colors.palette.neutral800 : theme.colors.palette.neutral200;

  // console.log('theme.colors.palette.neutral200:', theme.colors.palette.neutral200);
  // console.log('theme.colors.palette.neutral800:', theme.colors.palette.neutral800);

  console.log('textColor:', textColor);
  if (lumi > 0.5) {
    console.log('tag.name:', tag.name);
    console.log('lumi:', lumi);
  }

  return (
    <View
      key={tag.id}
      style={[
        themed($tagChip),
        // tag.color && { backgroundColor: tag.color + "20", borderColor: tag.color },
        tag.color && { backgroundColor: tag.color, borderColor: tag.color },
        // tag.color && { borderColor: tag.color },
      ]}
    >
      <Text
        text={tag.name}
        // style={[themed($tagText), tag.color && { color: neutral800 }]}
        style={[themed($tagText), tag.color && { color: neutral800 }]}
      />
    </View>
  )
}

const $tagChip: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  borderColor: colors.border,
  borderWidth: 0,
  borderRadius: 4,
  paddingHorizontal: 8,
  paddingVertical: 4,
})

const $tagText: ThemedStyle<TextStyle> = ({ colors }) => ({
  // fontSize: 12,
  // color: "#666",
  // textShadowColor: colors.palette.neutral100,
  // textShadowRadius: 8
})
