import { FC, useEffect, useMemo, useState } from "react"
import { Alert, View } from "react-native"
import type { ViewStyle } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { type ContentStyle } from "@shopify/flash-list"
import { FlashList } from "@shopify/flash-list"

import type { ItemPublic } from "@/client/types.gen"
import { Button } from "@/components/lib/Button"
import { DebugView } from "@/components/lib/DebugView"
import { EmptyState } from "@/components/lib/EmptyState"
import { ItemCard } from "@/components/lib/ItemCard"
import { MotiView } from "@/components/lib/MotiView"
import { Screen } from "@/components/lib/Screen"
import { Text } from "@/components/lib/Text"
import { ItemsStackParamList } from "@/navigators/ItemsStackNavigator"
import { extractErrorMessage } from "@/services/api/errorHandling"
import { useItems } from "@/services/api/hooks"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import { type ThemedStyle } from "@/theme/types"

interface ItemsScreenProps {}

export const ItemsScreen: FC<ItemsScreenProps> = () => {
  const { theme, themed } = useAppTheme()
  const navigation = useNavigation<NativeStackNavigationProp<ItemsStackParamList>>()

  const [debugInfo, setDebugInfo] = useState("")

  // TanStack Query hooks
  const { data: itemsData, isLoading: loading, error: itemsError, refetch } = useItems()

  // Extract items from the response
  const items = itemsData?.data || []
  const numColumns = useMemo(
    () => (theme.screen.lg ? 4 : theme.screen.md ? 3 : theme.screen.sm ? 2 : 1),
    [theme.screen],
  )


  // Update debug info when items load
  useEffect(() => {
    if (itemsData) {
      setDebugInfo(`Loaded ${items.length} items successfully`)
    } else if (itemsError) {
      setDebugInfo(`Error loading items: ${extractErrorMessage(itemsError)}`)
    }
  }, [itemsData, itemsError, items.length])

  const renderItem = ({ item, index }: { item: ItemPublic; index: number }) => {
    const modIndex = index % numColumns
    const itemMargin = {
      marginLeft: modIndex === 0 ? 0 : 24,
    }

    return (
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
        style={themed(itemMargin)}
      >
        <ItemCard item={item} onPress={() => navigation.navigate("item", { itemId: item.id })} />
      </MotiView>
    )
  }

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
        {items.length > 0 && <Text text={`(${items.length})`} preset="heading" />}
      </View>

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
          <FlashList<ItemPublic>
            numColumns={numColumns}
            showsVerticalScrollIndicator={false}
            masonry
            optimizeItemArrangement={false}
            data={items}
            ItemSeparatorComponent={() => (
              <View style={{ height: theme.spacing.xxl, width: theme.spacing.xxl }} />
            )} // gap between items
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

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  marginBottom: spacing.sm,
})

const $debugSection: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.border,
  borderWidth: 1,
  // color: "#191015",
  padding: 12,
  marginBottom: 16,
  borderRadius: 8,
})

const $itemsSection = { flex: 1, zIndex: 10, elevation: 1 }

const $itemsList: ThemedStyle<ContentStyle> = ({ spacing }) => ({
  paddingTop: spacing.sm,
  paddingBottom: spacing.lg,
})

const $testButton = { marginTop: 8 }

const $emptyState: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xxl,
})
