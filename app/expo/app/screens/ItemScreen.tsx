import React, { FC } from "react"
import { View, ViewStyle } from "react-native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"

import { Button } from "@/components/lib/Button"
import { Screen } from "@/components/lib/Screen"
import { Text } from "@/components/lib/Text"
import { MotiView } from "@/components/MotiView"
import { useItem } from "@/services/api/hooks"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import { type ThemedStyle } from "@/theme/types"

import { ItemsStackParamList } from "@/navigators/ItemsStackNavigator"

type ItemScreenProps = NativeStackScreenProps<ItemsStackParamList, "item">

export const ItemScreen: FC<ItemScreenProps> = ({ route, navigation }) => {
  const { themed } = useAppTheme()
  const { itemId } = route.params

  const { data: itemData, isLoading } = useItem(itemId)
  const item = itemData

  return (
    <Screen preset="auto" contentContainerStyle={themed($styles.container)}>
      <View style={themed($header)}>
        <Button
          text="← Back"
          preset="default"
          onPress={() => navigation.goBack()}
          style={themed($backButton)}
        />
      </View>

      {isLoading ? (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 300 }}
        >
          <Text text="Loading item..." preset="default" />
        </MotiView>
      ) : item ? (
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", damping: 15, stiffness: 150 }}
          style={themed($content)}
        >
          <Text text={item.title} preset="heading" style={themed($title)} />
          
          {item.description && (
            <Text text={item.description} preset="default" style={themed($description)} />
          )}

          {item.tags && item.tags.length > 0 && (
            <View style={themed($section)}>
              <Text text="Tags" preset="subheading" style={themed($sectionTitle)} />
              <View style={themed($tagsContainer)}>
                {item.tags.map((tag) => (
                  <View
                    key={tag.id}
                    style={[
                      themed($tagChip),
                      tag.color && { backgroundColor: tag.color + "20", borderColor: tag.color },
                    ]}
                  >
                    <Text
                      text={tag.name}
                      preset="default"
                      style={[themed($tagText), tag.color && { color: tag.color }]}
                    />
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={themed($section)}>
            <Text text="Details" preset="subheading" style={themed($sectionTitle)} />
            <Text text={`ID: ${item.id}`} preset="formHelper" style={themed($styles.mutedText)} />
            <Text text={`Owner: ${item.owner_id}`} preset="formHelper" style={themed($styles.mutedText)} />
          </View>
        </MotiView>
      ) : (
        <Text text="Item not found" preset="default" />
      )}
    </Screen>
  )
}

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $backButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignSelf: "flex-start",
  marginBottom: spacing.sm,
})

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
})

const $title: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $description: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $section: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $sectionTitle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
})

const $tagsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.xs,
})

const $tagChip: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderColor: colors.border,
  borderWidth: 1,
  borderRadius: 4,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
})

const $tagText: ThemedStyle<ViewStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.text,
})
