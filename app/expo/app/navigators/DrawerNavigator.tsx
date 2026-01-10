import { ComponentType } from "react"
import { NavigatorScreenParams } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { MainDrawerWrapper } from "@/components/lib/MainDrawerWrapper"
import { TagsScreen } from "@/screens/TagsScreen"
import { UserProfileScreen } from "@/screens/UserProfileScreen"
import { DemoShowroomScreen } from "@/screens/DemoShowroomScreen/DemoShowroomScreen"
import { DemoDebugScreen } from "@/screens/DemoDebugScreen"

import { TabNavigator, DemoTabParamList } from "./TabNavigator"

export type DrawNavigatorParamList = {
  userprofile: undefined
  tags: undefined
  tab: NavigatorScreenParams<DemoTabParamList>
  "development/showroom": { queryIndex?: string; itemIndex?: string }
  "development/debug": undefined
}

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<DrawNavigatorParamList>()

// Wrapper component to add drawer functionality to screens
// This ensures the stack navigator is always a direct child of a navigator
const withDrawer = <P extends object>(Component: ComponentType<P>) => {
  return (props: P) => (
    <MainDrawerWrapper>
      <Component {...props} />
    </MainDrawerWrapper>
  )
}

// Wrapped screen components with drawer functionality
const UserProfileScreenWithDrawer = withDrawer(UserProfileScreen)
const TagsScreenWithDrawer = withDrawer(TagsScreen)
const DemoShowroomScreenWithDrawer = withDrawer(DemoShowroomScreen)
const DemoDebugScreenWithDrawer = withDrawer(DemoDebugScreen)
const TabNavigatorWithDrawer = withDrawer(TabNavigator)

// Stack navigator is now a direct child - no non-navigator wrapper
// Drawer functionality is provided via screen-level wrappers
export const DrawerNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="tab">
      <Stack.Screen name="userprofile" component={UserProfileScreenWithDrawer} />
      <Stack.Screen name="tags" component={TagsScreenWithDrawer} />
      <Stack.Screen name="tab" component={TabNavigatorWithDrawer} />
      <Stack.Screen name="development/showroom" component={DemoShowroomScreenWithDrawer} />
      <Stack.Screen name="development/debug" component={DemoDebugScreenWithDrawer} />
    </Stack.Navigator>
  )
}
