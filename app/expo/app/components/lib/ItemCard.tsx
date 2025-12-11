import React, { FC } from "react"
import { View, Pressable, Image } from "react-native"
import type { ImageStyle, ViewStyle } from "react-native"
import type { ItemPublic } from "@/client/types.gen"
import { Text } from "@/components/lib/Text"
import { useAppTheme } from "@/theme/context"
import { type ThemedStyle } from "@/theme/types"
import { TagChip } from "./TagChip"

interface ItemCardProps {
  item: ItemPublic
  onPress: () => void
}

export const ItemCard: FC<ItemCardProps> = ({ item, onPress }) => {
  const { themed } = useAppTheme()

  return (
    <Pressable style={themed($itemContent)} onPress={onPress}>
      {item.image_url && (
        <Image
          source={{ uri: item.image_url }} style={themed($itemImage)} resizeMode="cover"
        />
      )}
      {item.tags && item.tags.length > 0 && (
        <View style={themed($tagsContainer)}>
          {item.tags.map((tag) => (
            <TagChip key={tag.id} tag={tag} />
          ))}
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

const $tagsContainer = {
  flexDirection: "row" as const,
  flexWrap: "wrap" as const,
  marginTop: 8,
  marginBottom: 8,
  gap: 6,
}

const $itemContainer: ViewStyle = {
  // padding: 16,
  // marginBottom: 12,
  // borderRadius: 8,
  // borderColor: "#f5f5f5",
  // borderWidth: 1,
}
