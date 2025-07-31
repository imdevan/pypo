import React, { FC, useState } from "react"
import { View, FlatList, Alert } from "react-native"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { Button } from "@/components/Button"
import { TextField } from "@/components/TextField"
import { useAuth } from "@/context/AuthContext"
import { useItems, useCreateItem, useDeleteItem } from "@/services/api/hooks"
import type { ItemPublic } from "@/client/types.gen"
import { useAppTheme } from "@/theme/context"

interface ItemsScreenProps {}

export const ItemsScreen: FC<ItemsScreenProps> = () => {
  const { logout, isAuthenticated, authToken } = useAuth()
  const { themed } = useAppTheme()
  
  const [newItemTitle, setNewItemTitle] = useState("")
  const [newItemDescription, setNewItemDescription] = useState("")
  const [debugInfo, setDebugInfo] = useState("")

  // TanStack Query hooks
  const { data: itemsData, isLoading: loading, error: itemsError, refetch } = useItems(authToken)
  const createItemMutation = useCreateItem()
  const deleteItemMutation = useDeleteItem()

  // Extract items from the response
  const items = itemsData?.data || []

  const createItem = async () => {
    if (!newItemTitle.trim()) {
      Alert.alert("Error", "Title is required")
      return
    }

    if (!authToken) {
      Alert.alert("Error", "No authentication token")
      return
    }

    try {
      await createItemMutation.mutateAsync({
        body: {
          title: newItemTitle.trim(),
          description: newItemDescription.trim() || undefined,
        },
        headers: { Authorization: `Bearer ${authToken}` },
      })
      
      setNewItemTitle("")
      setNewItemDescription("")
      Alert.alert("Success", "Item created successfully")
    } catch (error) {
      Alert.alert("Error", "Failed to create item")
    }
  }

  const deleteItem = async (id: string) => {
    if (!authToken) {
      Alert.alert("Error", "No authentication token")
      return
    }

    try {
      await deleteItemMutation.mutateAsync({ 
        path: { id },
        headers: { Authorization: `Bearer ${authToken}` },
      })
      Alert.alert("Success", "Item deleted successfully")
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

  const renderItem = ({ item }: { item: ItemPublic }) => (
    <View key={item.id} style={themed($itemContainer)}>
      <View style={themed($itemContent)}>
        <Text text={item.title} preset="subheading" />
        {item.description && <Text text={item.description} preset="default" style={themed($itemDescription)} />}
        <Text text={`ID: ${item.id}`} preset="formHelper" />
      </View>
      <Button
        text="Delete"
        preset="default"
        onPress={() => deleteItem(item.id)}
        style={themed($deleteButton)}
      />
    </View>
  )

  if (!isAuthenticated) {
    return (
      <Screen preset="auto" contentContainerStyle={themed($screenContentContainer)}>
        <Text text="Please log in to view items" preset="heading" />
        <Button text="Go to Login" preset="reversed" onPress={() => {}} />
      </Screen>
    )
  }

  return (
    <Screen preset="auto" contentContainerStyle={themed($screenContentContainer)}>
      <View style={themed($header)}>
        <Text text="My Items" preset="heading" />
        <Button text="Logout" preset="default" onPress={logout} />
      </View>

      {/* Debug Info */}
      <View style={themed($debugSection)}>
        <Text text="Debug Info:" preset="formLabel" />
        <Text text={debugInfo} preset="formHelper" />
        <Text text={`Authenticated: ${isAuthenticated}`} preset="formHelper" />
        <Text text={`Token: ${authToken ? 'Present' : 'Missing'}`} preset="formHelper" />
        <Button
          text="Refresh Items"
          preset="default"
          onPress={() => refetch()}
          style={themed($testButton)}
        />
      </View>

      <View style={themed($createSection)}>
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
      </View>

      <View style={themed($itemsSection)}>
        <Text text="Your Items" preset="subheading" style={themed($sectionTitle)} />
        {loading ? (
          <Text text="Loading items..." preset="default" />
        ) : items.length === 0 ? (
          <Text text="No items yet. Create your first item above!" preset="default" />
        ) : (
            items.map(item => renderItem({item}))
          // <FlatList
          //   data={items}
          //   renderItem={renderItem}
          //   keyExtractor={(item) => item.id}
          //   style={themed($itemsList)}
          // />
        )}
      </View>
    </Screen>
  )
}

const $screenContentContainer = { flex: 1, padding: 16 }

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