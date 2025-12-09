import { View } from "react-native"

export const MasonryList: FC = () => View
// import { MasonryFlashList } from "@shopify/flash-list"
// import { useMemo } from "react"
//
// interface MasonryListProps {
//   numColumns?: number
//
// }
//
// export const MasonryList: FC<MasonryListProps> = ({
//   numColumns,
//   showsVerticalScrollIndicator,
//   items,
//   ItemSeparatorComponent,
//   estimatedItemSize=100,
//   renderItem,
//   contentContainerStyle
// }) => {
//
//   const nimColumns = useMemo(() => 4, )
//   const renderItem = ({item, index}) {
//
//   }
//
//   return (
//     <>
//       <MasonryFlashList<T>
//         numColumns={numColumns}
//         showsVerticalScrollIndicator={false}
//         data={items}
//         ItemSeparatorComponent={() => <View style={{ height: 12, width: 12 }} />} // gap between items
//         estimatedItemSize={100}
//         renderItem={_renderItem}
//         ListEmptyComponent={
//           <MotiView
//             from={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ type: "spring", damping: 15, stiffness: 150 }}
//           >
//             <EmptyState
//               preset="generic"
//               style={themed($emptyState)}
//               contentTx="demoItemsScreen:noItems"
//               // button={favoritesOnly ? "" : undefined}
//               // buttonOnPress={manualRefresh}
//               // imageStyle={$emptyStateImage}
//               ImageProps={{ resizeMode: "contain" }}
//             />
//             {/* <Text text="No items yet. Create your first item above!" preset="default" /> */}
//           </MotiView>
//         }
//         contentContainerStyle={themed($itemsList)}
//       />
//     </>
//   )
// }
