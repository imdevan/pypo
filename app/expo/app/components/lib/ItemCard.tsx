import { FC, memo } from "react"
import { View, Pressable, Image } from "react-native"
import type { ImageStyle, TextStyle, ViewStyle } from "react-native"

import type { ItemPublic } from "@/client/types.gen"
import { Text } from "@/components/lib/Text"
import { useAppTheme } from "@/theme/context"
import { type ThemedStyle } from "@/theme/types"

import { TagChip } from "./TagChip"
import { VideoThumbnail } from "./VideoThumbnail"

interface ItemCardProps {
  item: ItemPublic
  onPress: () => void
  maxTags?: number
}

const ItemCardComponent: FC<ItemCardProps> = ({ item, onPress, maxTags = 2 }) => {
  const { themed } = useAppTheme()

  // Access video_url and video_thumbnail_url from item
  const videoUrl = item.video_url || null
  const videoThumbnailUrl = item.video_thumbnail_url || null

  return (
    <Pressable style={themed($itemContent)} onPress={onPress}>
      {/* Show video thumbnail if video exists, otherwise show image */}
      {videoUrl ? (
        <View style={themed($itemVideoContainer)}>
          <VideoThumbnail
            videoUri={videoUrl}
            thumbnailUri={videoThumbnailUrl}
            onPress={onPress}
            showPlayButton={false}
            style={themed($itemVideoThumbnail)}
          />
        </View>
      ) : item.image_url ? (
        <Image source={{ uri: item.image_url }} style={themed($itemImage)} resizeMode="cover" />
      ) : null}
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

ItemCardComponent.displayName = "ItemCard"

export const ItemCard = memo(ItemCardComponent, (prevProps, nextProps) => {
  // Custom comparison function for memo
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.title === nextProps.item.title &&
    prevProps.item.description === nextProps.item.description &&
    prevProps.item.image_url === nextProps.item.image_url &&
    prevProps.item.video_url === nextProps.item.video_url &&
    prevProps.item.video_thumbnail_url === nextProps.item.video_thumbnail_url &&
    prevProps.item.tags?.length === nextProps.item.tags?.length &&
    prevProps.maxTags === nextProps.maxTags
  )
})

const $itemContent: ViewStyle = {
  width: "100%",
}

const $itemImage: ThemedStyle<ImageStyle> = ({ colors, spacing }) => ({
  width: "100%",
  height: 150,
  borderRadius: 6,
  marginBottom: spacing.xs,
  borderWidth: 1,
  borderColor: colors.border,
})

const $itemVideoContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
})

const $itemVideoThumbnail: ThemedStyle<ViewStyle> = () => ({
  borderRadius: 6,
})

const $itemDescription = { marginTop: 4, marginBottom: 8 }

const $tagsContainer: ThemedStyle<ViewStyle> = ({ _spacing }) => ({
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

// Enable why-did-you-render tracking for ItemCard
if (__DEV__ && process.env.__WDYR__) {
  ItemCard.whyDidYouRender = true
}
