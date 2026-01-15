import { ComponentRef, FC, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Pressable, View } from "react-native"
import type { ViewStyle } from "react-native"
import { useFocusEffect, useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { type ContentStyle } from "@shopify/flash-list"
import { FlashList } from "@shopify/flash-list"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import { runOnJS } from "react-native-reanimated"

import type { ItemPublic } from "@/client/types.gen"
import { Button } from "@/components/lib/Button"
import { DebugView } from "@/components/lib/DebugView"
import { EmptyState } from "@/components/lib/EmptyState"
import { Icon } from "@/components/lib/Icon"
import { ItemCard } from "@/components/lib/ItemCard"
import { MotiView } from "@/components/lib/MotiView"
import { Screen } from "@/components/lib/Screen"
import { useHeaderPadding } from "@/components/lib/ScreenWithHeader"
import { Text } from "@/components/lib/Text"
import { TextField } from "@/components/lib/TextField"
import { ItemsStackParamList } from "@/navigators/ItemsStackNavigator"
import { useTabBarSpacing } from "@/navigators/TabNavigator"
import { extractErrorMessage } from "@/services/api/errorHandling"
import { useItems } from "@/services/api/hooks"
import { useAppTheme } from "@/theme/context"
import { type ThemedStyle } from "@/theme/types"
import { useMountLog } from "@/utils/useMountLog"

interface ItemsScreenProps {}

export const ItemsScreen: FC<ItemsScreenProps> = () => {
  const { theme, themed } = useAppTheme()
  const headerPadding = useHeaderPadding()
  const { paddingBottom } = useTabBarSpacing()
  const navigation = useNavigation<NativeStackNavigationProp<ItemsStackParamList>>()
  const [debugInfo, setDebugInfo] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchVisible, setIsSearchVisible] = useState(false)
  const searchInputRef = useRef<ComponentRef<typeof TextField>>(null)
  const searchInputRefValue = useRef("")
  const [numColumns, setNumColumns] = useState(2) // Default 2 columns on mobile

  // Screen mount verification - temporary debug logs
  useMountLog("Items")

  // TanStack Query hooks
  const { data: itemsData, isLoading: loading, error: itemsError, refetch } = useItems()

  // Extract items from the response
  const allItems = useMemo(() => itemsData?.data || [], [itemsData?.data])

  // Debounce search input to search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput)
    }, 300) // 300ms delay

    return () => {
      clearTimeout(timer)
    }
  }, [searchInput])

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return allItems
    }

    const query = searchQuery.toLowerCase().trim()
    return allItems.filter((item) => {
      // Search in title
      if (item.title.toLowerCase().includes(query)) {
        return true
      }

      // Search in description
      if (item.description?.toLowerCase().includes(query)) {
        return true
      }

      // Search in tag names
      if (item.tags?.some((tag) => tag.name.toLowerCase().includes(query))) {
        return true
      }

      return false
    })
  }, [allItems, searchQuery])

  const items = filteredItems

  // Track initial state for pinch gesture
  const initialColumnsRef = useRef<number>(2)

  // Callbacks for pinch gesture (must be stable)
  const setInitialPinchState = useCallback(() => {
    initialColumnsRef.current = numColumns
  }, [numColumns])

  const updateColumnsFromScale = useCallback((scale: number) => {
    setNumColumns((_prev) => {
      const initialColumns = initialColumnsRef.current
      // Calculate cumulative scale change from gesture start
      // Scale of 1.0 = no change, > 1.0 = zoom out (more columns), < 1.0 = zoom in (fewer columns)
      const scaleChange = scale - 1.0
      // Each 0.25 scale change = 1 column change
      const columnChange = Math.round(scaleChange / 0.25)
      const target = Math.max(1, Math.min(5, initialColumns + columnChange))
      return target
    })
  }, [])

  const snapToNearestColumn = useCallback(() => {
    setNumColumns((prev) => {
      // Ensure we're at a valid column count (1-5)
      return Math.max(1, Math.min(5, Math.round(prev)))
    })
  }, [])

  // Pinch gesture handler for column zoom
  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch()
        .onStart(() => {
          // Store initial state when gesture starts
          runOnJS(setInitialPinchState)()
        })
        .onUpdate((event) => {
          // Calculate column change based on scale
          // Scale > 1 = pinch out (more columns), Scale < 1 = pinch in (fewer columns)
          const scale = event.scale
          runOnJS(updateColumnsFromScale)(scale)
        })
        .onEnd(() => {
          // Snap to nearest valid column count on gesture end
          runOnJS(snapToNearestColumn)()
        }),
    [setInitialPinchState, updateColumnsFromScale, snapToNearestColumn],
  )

  // Determine what to show/hide based on column count
  const showDescription = numColumns <= 2
  const showTags = numColumns <= 3
  const showTitle = numColumns <= 4

  // Update debug info when items load
  useEffect(() => {
    if (itemsData) {
      setDebugInfo(`Loaded ${items.length} items successfully`)
    } else if (itemsError) {
      setDebugInfo(`Error loading items: ${extractErrorMessage(itemsError)}`)
    }
  }, [itemsData, itemsError, items.length])

  // Memoize navigation handler
  const handleItemPress = useCallback(
    (itemId: string) => {
      navigation.navigate("item", { itemId })
    },
    [navigation],
  )

  // Memoize item separator component
  const ItemSeparator = useMemo(() => {
    const Separator = () => <View style={{ height: theme.spacing.md }} />
    Separator.displayName = "ItemSeparator"
    return Separator
  }, [theme.spacing.md])

  // Memoize renderItem function
  const renderItem = useCallback(
    ({ item, index }: { item: ItemPublic; index: number }) => {
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
            delay: Math.min(index * 20, 200), // Reduced delay: max 200ms instead of 100ms per item
          }}
          exit={{
            opacity: 0,
            scale: 0.9,
            translateY: -20,
          }}
        >
          <ItemCard
            item={item}
            onPress={() => handleItemPress(item.id)}
            showTitle={showTitle}
            showDescription={showDescription}
            showTags={showTags}
          />
        </MotiView>
      )
    },
    [handleItemPress, showTitle, showDescription, showTags],
  )

  // Memoize key extractor
  const keyExtractor = useCallback((item: ItemPublic) => item.id, [])

  // Handle search button press
  const handleSearchPress = useCallback(() => {
    setIsSearchVisible(true)
    // Focus the input after a short delay to ensure it's rendered
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 100)
  }, [])

  // Handle search input change - ignore tabs and spaces if input is empty
  const handleSearchChange = useCallback(
    (text: string) => {
      // If current input is empty and new text is only whitespace, ignore it
      if (!searchInput.trim() && !text.trim()) {
        return
      }
      searchInputRefValue.current = text
      setSearchInput(text)
    },
    [searchInput],
  )

  // Handle search input blur - hide if empty (use ref to get current value)
  const handleSearchBlur = useCallback(() => {
    // Use a small delay to ensure state has updated
    setTimeout(() => {
      if (!searchInputRefValue.current.trim()) {
        setIsSearchVisible(false)
      }
    }, 100)
  }, [])

  // Hide search when screen loses focus (e.g., navigating to item detail)
  useFocusEffect(
    useCallback(() => {
      // When screen comes into focus, do nothing
      return () => {
        // When screen loses focus, hide search if empty (use ref to get current value)
        if (!searchInputRefValue.current.trim()) {
          setIsSearchVisible(false)
          searchInputRef.current?.blur()
        }
      }
    }, []),
  )

  return (
    <Screen preset="fixed" contentContainerStyle={themed($screenContainer)}>
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

      <GestureDetector gesture={pinchGesture}>
        <View style={themed($itemsSection)}>
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
              keyExtractor={keyExtractor}
              ItemSeparatorComponent={ItemSeparator}
              renderItem={renderItem}
              estimatedItemSize={200}
              ListHeaderComponent={
                <View style={themed($headerContainer)}>
                  <View style={themed($header)}>
                    <View style={themed($titleRow)}>
                      <Text text={`Items`} preset="heading" />
                      {allItems.length > 0 && (
                        <Text
                          text={
                            searchQuery
                              ? `(${items.length}/${allItems.length})`
                              : `(${allItems.length})`
                          }
                          preset="heading"
                        />
                      )}
                    </View>
                    <Pressable onPress={handleSearchPress} style={themed($searchButton)}>
                      <Icon name="search" size={24} />
                    </Pressable>
                  </View>
                  {isSearchVisible && (
                    <MotiView
                      from={{ opacity: 0, translateY: -10 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      exit={{ opacity: 0, translateY: -10 }}
                      transition={{ type: "timing", duration: 200 }}
                    >
                      <TextField
                        ref={searchInputRef}
                        placeholder="Search items..."
                        value={searchInput}
                        onChangeText={handleSearchChange}
                        onBlur={handleSearchBlur}
                        containerStyle={themed($searchField)}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </MotiView>
                  )}
                </View>
              }
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
              contentContainerStyle={[
                themed($itemsList),
                { paddingTop: headerPadding, paddingBottom },
              ]}
            />
          )}
        </View>
      </GestureDetector>
    </Screen>
  )
}

const $screenContainer: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  flex: 1,
  paddingHorizontal: 0,
})

const $headerContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingLeft: spacing.xs,
  paddingRight: spacing.xs,
  marginBottom: spacing.sm,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  marginBottom: spacing.md,
})

const $titleRow: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  gap: 8,
})

const $searchButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.xs,
})

const $searchField: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
})

const $debugSection: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.border,
  borderWidth: 1,
  // color: "#191015",
  padding: 12,
  marginBottom: 16,
  borderRadius: 8,
})

const $itemsSection: ViewStyle = {
  flex: 1,
  width: "100%",
  zIndex: 10,
  elevation: 1,
}

const $itemsList: ThemedStyle<ContentStyle> = ({ spacing }) => ({
  padding: spacing.xs,
})

const $testButton = { marginTop: 8 }

const $emptyState: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xxl,
})

// Enable why-did-you-render tracking for ItemsScreen
if (__DEV__ && process.env.__WDYR__) {
  ItemsScreen.whyDidYouRender = true
}
