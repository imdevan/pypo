import { FC } from "react"
import { View, Pressable, Image } from "react-native"
import type { ImageStyle, TextStyle, ViewStyle } from "react-native"

import type { ItemPublic } from "@/client/types.gen"
import { Text } from "@/components/lib/Text"
import { useAppTheme } from "@/theme/context"
import { type ThemedStyle } from "@/theme/types"

import { TagChip } from "./TagChip"

interface ItemCardProps {
  item: ItemPublic
  onPress: () => void
  maxTags?: number
}

export const ItemCard: FC<ItemCardProps> = ({ item, onPress, maxTags = 2 }) => {
  const { themed } = useAppTheme()

  return (
    <Pressable style={themed($itemContent)} onPress={onPress}>
      {item.image_url && (
        <Image source={{ uri: item.image_url }} style={themed($itemImage)} resizeMode="cover" />
      )}
      {item.tags && item.tags.length > 0 && (
        <View style={themed($tagsContainer)}>
          {item.tags.slice(0, maxTags).map((tag) => (
            <TagChip key={tag.id} tag={tag} variant="solid" />
          ))}
          {item.tags.length > maxTags && (
            <Text
              text={`+ ${item.tags.length - maxTags} more`}
              preset="formHelper"
              style={themed($moreTagsText)}
            />
          )}
        </View>
      )}

      <Text text={item.title} preset="subheading" />
      {item.description && (
        <Text text={item.description} preset="default" style={themed($itemDescription)} />
      )}
    </Pressable>
  )
}

const $itemContent = { flex: 1 }

const $itemImage: ThemedStyle<ImageStyle> = ({ colors, spacing }) => ({
  width: "100%",
  height: 150,
  borderRadius: 6,
  marginBottom: spacing.xs,
  borderWidth: 1,
  borderColor: colors.border,
})

const $itemDescription = { marginTop: 4, marginBottom: 8 }

const $tagsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  marginTop: 8,
  marginBottom: 8,
  gap: 6,
  alignItems: "center",
})

const $moreTagsText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  marginLeft: 4,
})
