import type { ViewStyle } from "react-native"
import { createDrawerNavigator, DrawerContentComponentProps } from "@react-navigation/drawer"
import { NavigatorScreenParams } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { MainDrawerWrapper } from "@/components/MainDrawerWrapper"
import { UserProfileScreen } from "@/screens/UserProfileScreen"
import type { ThemedStyle } from "@/theme/types"

import { TabNavigator, DemoTabParamList } from "./TabNavigator"

export type DrawNavigatorParamList = {
  UserProfile: undefined
  Tab: NavigatorScreenParams<DemoTabParamList>
}

const MyDrawer = createDrawerNavigator<DrawNavigatorParamList>()

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<DrawNavigatorParamList>()

// Create the main content component that contains the stack navigator
const StackContent = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Tab">
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen name="Tab" component={TabNavigator} />
    </Stack.Navigator>
  )
}

export const DrawerNavigator = () => {
  return (
    <MainDrawerWrapper>
      <StackContent />
    </MainDrawerWrapper>
  )
}

// Styles
const $drawer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  flex: 1,
})
