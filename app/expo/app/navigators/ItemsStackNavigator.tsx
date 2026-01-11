import { memo, useMemo } from "react"
import { CompositeScreenProps } from "@react-navigation/native"
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack"

import { ItemScreen } from "@/screens/ItemScreen"
import { ItemsScreen } from "@/screens/ItemsScreen"
import { useMountLog } from "@/utils/useMountLog"

import { DemoTabScreenProps } from "./TabNavigator"

export type ItemsStackParamList = {
  list: undefined
  item: { itemId: string }
}

export type ItemsStackScreenProps<T extends keyof ItemsStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<ItemsStackParamList, T>,
  DemoTabScreenProps<"items">
>

const Stack = createNativeStackNavigator<ItemsStackParamList>()

export const ItemsStackNavigator = memo(function ItemsStackNavigator() {
  useMountLog("ItemsStackNavigator", { logRenders: true })

  // Memoize screenOptions to prevent navigator remounts
  const screenOptions = useMemo(
    () => ({
      headerShown: false,
    }),
    [],
  )

  return (
    <Stack.Navigator screenOptions={screenOptions} initialRouteName="list">
      <Stack.Screen name="list" component={ItemsScreen} />
      <Stack.Screen
        name="item"
        component={ItemScreen}
        options={{
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  )
})
