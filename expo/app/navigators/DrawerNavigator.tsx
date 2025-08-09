import { createDrawerNavigator, DrawerContentComponentProps } from '@react-navigation/drawer';

import { ItemsScreen } from '@/screens/ItemsScreen';
import { DemoNavigator, DemoTabParamList } from './DemoNavigator';
import { NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import type { ThemedStyle } from "@/theme/types"
import type { ViewStyle } from "react-native"
import { MainDrawerWrapper } from '@/components/MainDrawerWrapper';

export type DrawNavigatorParamList = {
  DrawerItems: undefined;
  DrawerDemo: NavigatorScreenParams<DemoTabParamList>
};

const MyDrawer = createDrawerNavigator<DrawNavigatorParamList>();

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<DrawNavigatorParamList>()

// Create the main content component that contains the stack navigator
const StackContent = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="DrawerDemo">
      <Stack.Screen name="DrawerItems" component={ItemsScreen} />
      <Stack.Screen name="DrawerDemo" component={DemoNavigator} />
    </Stack.Navigator>
  )
}

export const DrawerNavigator = () => {
  return (
    <MainDrawerWrapper>
      <StackContent />
    </MainDrawerWrapper>
  );
};

// Styles
const $drawer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  flex: 1,
})