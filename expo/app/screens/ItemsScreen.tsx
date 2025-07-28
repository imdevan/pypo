import React, { FC, useEffect, useState } from "react"
import { View, FlatList, Alert } from "react-native"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { Button } from "@/components/Button"
import { TextField } from "@/components/TextField"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/services/api"
import type { ItemResponse } from "@/services/api/types"
import { useAppTheme } from "@/theme/context"

interface ItemsScreenProps {}

export const ItemsScreen: FC<ItemsScreenProps> = () => {
  const { logout, isAuthenticated, authToken } = useAuth()
  const { themed } = useAppTheme()
  
  const [items, setItems] = useState<ItemResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [newItemTitle, setNewItemTitle] = useState("")
  const [newItemDescription, setNewItemDescription] = useState("")
  const [creating, setCreating] = useState(false)
  const [debugInfo, setDebugInfo] = useState("")

  useEffect(() => {
    if (isAuthenticated) {
      loadItems()
    }
  }, [isAuthenticated])

  const loadItems = async () => {
    setLoading(true)
    setDebugInfo(`Loading items... Token: ${authToken ? 'Present' : 'Missing'}`)
    
    try {
      const result = await api.getItems()
      if (result.kind === "ok") {
        setItems(result.data.data)
        setDebugInfo(`Loaded ${result.data.data.length} items successfully`)
      } else {
        setDebugInfo(`Failed to load items: ${result.kind}`)
        Alert.alert("Error", "Failed to load items")
      }
    } catch (error) {
      setDebugInfo(`Error loading items: ${error}`)
      Alert.alert("Error", "Failed to load items")
    } finally {
      setLoading(false)
    }
  }

  const createItem = async () => {
    if (!newItemTitle.trim()) {
      Alert.alert("Error", "Title is required")
      return
    }

    setCreating(true)
    try {
      const result = await api.createItem(newItemTitle.trim(), newItemDescription.trim() || undefined)
      if (result.kind === "ok") {
        setItems([...items, result.data])
        setNewItemTitle("")
        setNewItemDescription("")
        Alert.alert("Success", "Item created successfully")
      } else {
        Alert.alert("Error", "Failed to create item")
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create item")
    } finally {
      setCreating(false)
    }
  }

  const deleteItem = async (id: string) => {
    try {
      const result = await api.deleteItem(id)
      if (result.kind === "ok") {
        setItems(items.filter(item => item.id !== id))
        Alert.alert("Success", "Item deleted successfully")
      } else {
        Alert.alert("Error", "Failed to delete item")
      }
    } catch (error) {
      Alert.alert("Error", "Failed to delete item")
    }
  }

  const testToken = async () => {
    try {
      setDebugInfo("Testing token...")
      const result = await api.testToken()
      if (result.kind === "ok") {
        setDebugInfo(`Token is valid! User: ${result.data.email}`)
        Alert.alert("Success", "Token is valid!")
      } else {
        setDebugInfo(`Token test failed: ${result.kind}`)
        Alert.alert("Error", "Token test failed")
      }
    } catch (error) {
      setDebugInfo(`Token test error: ${error}`)
      Alert.alert("Error", "Token test failed")
    }
  }

  const renderItem = ({ item }: { item: ItemResponse }) => (
    <View style={themed($itemContainer)}>
      <View style={themed($itemContent)}>
        <Text text={item.title} preset="subheading" />
        {item.description && <Text text={item.description} preset="default" style={themed($itemDescription)} />}
        <Text text={`Posted: ${new Date(item.date_posted).toLocaleDateString()}`} preset="formHelper" />
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
          text="Test Token"
          preset="default"
          onPress={testToken}
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
          disabled={creating || !newItemTitle.trim()}
        />
      </View>

      <View style={themed($itemsSection)}>
        <Text text="Your Items" preset="subheading" style={themed($sectionTitle)} />
        {loading ? (
          <Text text="Loading items..." preset="default" />
        ) : items.length === 0 ? (
          <Text text="No items yet. Create your first item above!" preset="default" />
        ) : (
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={themed($itemsList)}
          />
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
  backgroundColor: "#f0f0f0", 
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
  backgroundColor: "#f5f5f5"
}

const $itemContent = { flex: 1 }

const $itemDescription = { marginTop: 4, marginBottom: 8 }

const $deleteButton = { marginLeft: 12 }

const $testButton = { marginTop: 8 } 