import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack"
import { CompositeScreenProps } from "@react-navigation/native"

import { ItemsScreen } from "@/screens/ItemsScreen"
import { ItemScreen } from "@/screens/ItemScreen"

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

export function ItemsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="list"
    >
      <Stack.Screen name="list" component={ItemsScreen} />
      <Stack.Screen name="item" component={ItemScreen} />
    </Stack.Navigator>
  )
}
