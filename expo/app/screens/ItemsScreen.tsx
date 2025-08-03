import React, { FC, useState } from "react"
import { Alert } from "react-native"
import { DV } from "@/components/DV"
import { V } from "@/components/V"
import { MV } from "@/components/MV"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { Button } from "@/components/Button"
import { TextField } from "@/components/TextField"

import { useItems, useCreateItem, useDeleteItem } from "@/services/api/hooks"
import type { ItemPublic } from "@/client/types.gen"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"

interface ItemsScreenProps {}

export const ItemsScreen: FC<ItemsScreenProps> = () => {
  const { themed } = useAppTheme()
  
  const [newItemTitle, setNewItemTitle] = useState("")
  const [newItemDescription, setNewItemDescription] = useState("")
  const [debugInfo, setDebugInfo] = useState("")

  // TanStack Query hooks
  const { data: itemsData, isLoading: loading, error: itemsError, refetch } = useItems()
  const createItemMutation = useCreateItem()
  const deleteItemMutation = useDeleteItem()

  // Extract items from the response
  const items = itemsData?.data || []

  const createItem = async () => {
    if (!newItemTitle.trim()) {
      Alert.alert("Error", "Title is required")
      return
    }

    try {
      await createItemMutation.mutateAsync({
        body: {
          title: newItemTitle.trim(),
          description: newItemDescription.trim() || undefined,
        },
      })
      
      setNewItemTitle("")
      setNewItemDescription("")
    } catch (error) {
      Alert.alert("Error", "Failed to create item")
    }
  }

  const deleteItem = async (id: string) => {
    try {
      await deleteItemMutation.mutateAsync({ 
        path: { id },
      })
    } catch (error) {
      Alert.alert("Error", "Failed to delete item")
    }
  }

  // Update debug info when items load
  React.useEffect(() => {
    if (itemsData) {
      setDebugInfo(`Loaded ${items.length} items successfully`)
    } else if (itemsError) {
      setDebugInfo(`Error loading items: ${itemsError.message}`)
    }
  }, [itemsData, itemsError, items.length])

  const renderItem = ({ item, index }: { item: ItemPublic; index: number }) => (
    <MV
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
      <V style={themed($itemContent)}>
        <Text text={item.title} preset="subheading" />
        {item.description && <Text text={item.description} preset="default" style={themed($itemDescription)} />}
        <Text text={`ID: ${item.id}`} preset="formHelper" />
      </V>
      <Button
        text="Delete"
        preset="default"
        onPress={() => deleteItem(item.id)}
        style={themed($deleteButton)}
      />
    </MV>
  )



  return (
    <Screen 
      preset="auto" 
      contentContainerStyle={$styles.container}
      safeAreaEdges={["top"]}
    >
      <V style={themed($header)}>
        <Text text="My Items" preset="heading" />
      </V>

      {/* Debug Info */}
      <DV>
        <V style={themed($debugSection)}>
          <Text text="Debug Info:" preset="formLabel" />
          <Text text={debugInfo} preset="formHelper" />
          <Button
            text="Refresh Items"
            preset="default"
            onPress={() => refetch()}
            style={themed($testButton)}
          />
        </V>
      </DV>

      <V style={themed($createSection)}>
        <Text text="Create New Item" preset="subheading" style={themed($sectionTitle)} />
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
        <Button
          text="Create Item"
          preset="reversed"
          onPress={createItem}
          disabled={createItemMutation.isPending || !newItemTitle.trim()}
        />
      </V>

      <V style={themed($itemsSection)}>
        <Text text={`Your Items (${items.length})`} preset="subheading" style={themed($sectionTitle)} />
        {loading ? (
          <MV
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "timing", duration: 300 }}
          >
            <Text text="Loading items..." preset="default" />
          </MV>
        ) : items.length === 0 ? (
          <MV
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 15, stiffness: 150 }}
          >
            <Text text="No items yet. Create your first item above!" preset="default" />
          </MV>
        ) : (
          items.map((item, index) => renderItem({ item, index }))
        )}
      </V>
    </Screen>
  )
}

const $header = { 
  flexDirection: "row" as const, 
  justifyContent: "space-between" as const, 
  alignItems: "center" as const, 
  marginBottom: 20 
}

const $debugSection = { 
  borderColor: "#f0f0f0", 
  borderWidth: 1,
  // color: "#191015",
  padding: 12, 
  marginBottom: 16, 
  borderRadius: 8 
}

const $createSection = { marginBottom: 30 }

const $itemsSection = { flex: 1 }

const $sectionTitle = { marginBottom: 16 }

const $inputField = { marginBottom: 12 }

const $itemsList = { flex: 1 }

const $itemContainer = { 
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