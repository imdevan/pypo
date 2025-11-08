import React, { FC, useState } from "react"
import { Alert, View, Pressable } from "react-native"
import type { ViewStyle } from "react-native"
import { type ContentStyle } from "@shopify/flash-list"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"

import { ItemsStackParamList } from "@/navigators/ItemsStackNavigator"

import type { ItemPublic } from "@/client/types.gen"
import { DebugView } from "@/components/DebugView"
import { Button } from "@/components/lib/Button"
import { DropDown } from "@/components/lib/DropDown"
import { EmptyState } from "@/components/lib/EmptyState"
import { ListView } from "@/components/lib/ListView"
import { Screen } from "@/components/lib/Screen"
import { Text } from "@/components/lib/Text"
import { TextField } from "@/components/lib/TextField"
import { MotiView } from "@/components/MotiView"
import { PopupForm } from "@/components/PopupForm"
import { extractErrorMessage } from "@/services/api/errorHandling"
import { useItems, useCreateItem, useDeleteItem } from "@/services/api/hooks"
import { useTags } from "@/services/api/hooks/useTags"
import { colors } from "@/theme/colors"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import { type ThemedStyle } from "@/theme/types"
import { PressableIcon } from "@/components/lib/Icon"
import { IconProps } from "@expo/vector-icons/build/createIconSet"

interface ItemsScreenProps {}

export const ItemsScreen: FC<ItemsScreenProps> = () => {
  const { themed } = useAppTheme()
  const navigation = useNavigation<NativeStackNavigationProp<ItemsStackParamList>>()

  const [newItemTitle, setNewItemTitle] = useState("")
  const [newItemDescription, setNewItemDescription] = useState("")
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [debugInfo, setDebugInfo] = useState("")
  const [formOpen, setFormOpen] = useState(false)

  // TanStack Query hooks
  const { data: itemsData, isLoading: loading, error: itemsError, refetch } = useItems()
  const { data: tagsData, isLoading: tagsLoading } = useTags()
  const createItemMutation = useCreateItem()
  const deleteItemMutation = useDeleteItem()

  // Extract items from the response
  const items = itemsData?.data || []

  // Extract tags from the response and format for dropdown
  const tags = tagsData?.data || []
  const tagOptions = tags.map((tag) => ({
    label: tag.name,
    value: tag.id,
  }))

  const createItem = async () => {
    console.log("Creating item", newItemTitle.trim(), newItemDescription.trim())

    if (!newItemTitle.trim()) {
      Alert.alert("Error", "Title is required")
      return
    }

    try {
      console.log("Creating item", newItemTitle.trim(), newItemDescription.trim())
      await createItemMutation.mutateAsync({
        body: {
          title: newItemTitle.trim(),
          description: newItemDescription.trim() || undefined,
          tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined,
        },
      })

      resetNewItem()
    } catch (error) {
      Alert.alert("Error", extractErrorMessage(error))
    }
  }

  const resetNewItem = () => {
    setNewItemTitle("")
    setNewItemDescription("")
    setSelectedTagIds([])
    setFormOpen(false)
  }

  const deleteItem = async (id: string) => {
    try {
      await deleteItemMutation.mutateAsync({
        path: { id },
      })
    } catch (error) {
      Alert.alert("Error", extractErrorMessage(error))
    }
  }

  // Update debug info when items load
  React.useEffect(() => {
    if (itemsData) {
      setDebugInfo(`Loaded ${items.length} items successfully`)
    } else if (itemsError) {
      setDebugInfo(`Error loading items: ${extractErrorMessage(itemsError)}`)
    }
  }, [itemsData, itemsError, items.length])

  const renderItem = ({ item, index }: { item: ItemPublic; index: number }) => (
    <MotiView
      key={item.id}
      from={{
        opacity: 0,
        scale: 0.9,
        translateY: 20,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        translateY: 0,
      }}
      transition={{
        type: "spring",
        damping: 15,
        stiffness: 150,
        delay: index * 100, // Stagger animation by 100ms per item
      }}
      exit={{
        opacity: 0,
        scale: 0.9,
        translateY: -20,
      }}
      style={themed($itemContainer)}
    >
      <Pressable
        style={themed($itemContent)}
        onPress={() => navigation.navigate("item", { itemId: item.id })}
      >
        <Text text={item.title} preset="subheading" />
        {item.description && (
          <Text text={item.description} preset="default" style={themed($itemDescription)} />
        )}
        {item.tags && item.tags.length > 0 && (
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
                  preset="formHelper"
                  style={[themed($tagText), tag.color && { color: tag.color }]}
                />
              </View>
            ))}
          </View>
        )}
      </Pressable>
      <Button
        text="Delete"
        preset="default"
        onPress={() => deleteItem(item.id)}
        style={themed($deleteButton)}
      />
    </MotiView>
  )

  return (
    <Screen preset="auto" contentContainerStyle={themed($styles.container)}>
      {/* Debug Info */}
      <DebugView>
        <View style={themed($debugSection)}>
          <Text text="Debug Info:" preset="formLabel" />
          <Text text={debugInfo} preset="formHelper" />
          <Button
            text="Refresh Items"
            preset="default"
            onPress={() => refetch()}
            style={themed($testButton)}
          />
        </View>
      </DebugView>

      <View style={themed($header)}>
        <Text text={`Items`} preset="heading" />
        <View style={$headerRight}>
          {items.length > 0 && (
            <Text text={`(${items.length})`} preset="heading" />
          )}
          {/* todo: fix styling style={themed(({colors}) => ({stroke: colors.tintColor}))} */}
          <PressableIcon name ="plus" size={30} onPress={() => setFormOpen(state => !state)} />
        </View>
      </View>
      <PopupForm
        open={formOpen}
        onSuccess={createItem}
        onCancel={resetNewItem}
        disabled={createItemMutation.isPending}
        saveDisabled={createItemMutation.isPending || !newItemTitle.trim()}
      >
        <TextField
          value={newItemTitle}
          onChangeText={setNewItemTitle}
          placeholder="Item title"
          containerStyle={themed($inputField)}
        />
        <TextField
          value={newItemDescription}
          onChangeText={setNewItemDescription}
          placeholder="Item description (optional)"
          containerStyle={themed($inputField)}
        />
        <DropDown
          label="Tags (optional)"
          items={tagOptions}
          multiple={true}
          value={selectedTagIds}
          setValue={(value: string[] | null) => setSelectedTagIds(value || [])}
          placeholder="Select tags..."
          loading={tagsLoading}
          badgeColors={tags?.map((tag) => tag.color || colors.background)}
          searchable={true}
          searchPlaceholder="Search tags..."
          closeAfterSelecting={false}
        />
      </PopupForm> 

      <View style={themed($itemsSection)}>
        {/* <Text
          text={`Your Items (${items.length})`}
          preset="subheading"
          style={{ marginBottom: 16 }}
        /> */}
        {loading ? (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "timing", duration: 300 }}
          >
            <Text text="Loading items..." preset="default" />
          </MotiView>
        ) : (
          <ListView<ItemPublic>
            showsVerticalScrollIndicator={false}
            data={items}
            estimatedItemSize={100}
            renderItem={({ item, index }) => renderItem({ item, index })}
            ListEmptyComponent={
              <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 150 }}
              >
                <EmptyState
                  preset="generic"
                  style={themed($emptyState)}
                  contentTx="demoItemsScreen:noItems"
                  // button={favoritesOnly ? "" : undefined}
                  // buttonOnPress={manualRefresh}
                  // imageStyle={$emptyStateImage}
                  ImageProps={{ resizeMode: "contain" }}
                />
                {/* <Text text="No items yet. Create your first item above!" preset="default" /> */}
              </MotiView>
            }
            contentContainerStyle={themed($itemsList)}
          />
        )}
      </View>
    </Screen>
  )
}
const $headerRight = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  gap: 8,
}

const $header: ThemedStyle<ViewStyle> = ({ spacing, width }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  marginBottom: spacing.sm,
})

const $debugSection: ThemedStyle<ViewStyle> = ({colors}) => ({
  borderColor: colors.border,
  borderWidth: 1,
  // color: "#191015",
  padding: 12,
  marginBottom: 16,
  borderRadius: 8,
})

const $itemsSection = { flex: 1, zIndex: 10, elevation: 1 }

const $inputField = { marginBottom: 12 }

const $itemsList: ThemedStyle<ContentStyle> = ({ spacing }) => ({
  paddingTop: spacing.sm,
  paddingBottom: spacing.lg,
})

const $itemContainer: ViewStyle = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  padding: 16,
  marginBottom: 12,
  borderRadius: 8,
  // backgroundColor: "#f5f5f5"
  borderColor: "#f5f5f5",
  borderWidth: 1,
}

const $itemContent = { flex: 1 }

const $itemDescription = { marginTop: 4, marginBottom: 8 }

const $deleteButton = { marginLeft: 12 }

const $testButton = { marginTop: 8 }

const $emptyState: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xxl,
})

const $tagsContainer = {
  flexDirection: "row" as const,
  flexWrap: "wrap" as const,
  marginTop: 8,
  marginBottom: 8,
  gap: 6,
}

const $tagChip = {
  backgroundColor: colors.background,
  borderColor: colors.border,
  borderWidth: 1,
  borderRadius: 4,
  paddingHorizontal: 8,
  paddingVertical: 4,
}

const $tagText = {
  fontSize: 12,
  color: "#666",
}
