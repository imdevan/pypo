import { NavigatorScreenParams } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { MainDrawerWrapper } from "@/components/lib/MainDrawerWrapper"
import { TagsScreen } from "@/screens/TagsScreen"
import { UserProfileScreen } from "@/screens/UserProfileScreen"

import { TabNavigator, DemoTabParamList } from "./TabNavigator"

export type DrawNavigatorParamList = {
  userprofile: undefined
  tags: undefined
  tab: NavigatorScreenParams<DemoTabParamList>
}

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<DrawNavigatorParamList>()

// Create the main content component that contains the stack navigator
const StackContent = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="tab">
      <Stack.Screen name="userprofile" component={UserProfileScreen} />
      <Stack.Screen name="tags" component={TagsScreen} />
      <Stack.Screen name="tab" component={TabNavigator} />
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
