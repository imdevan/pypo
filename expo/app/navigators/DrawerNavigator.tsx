import { Items } from '@/client';
import { createDrawerNavigator, DrawerContentComponentProps } from '@react-navigation/drawer';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { MainDrawerWrapper } from '@/components/MainDrawerWrapper';
import { ItemsScreen } from '@/screens/ItemsScreen';
import { WelcomeScreen } from '@/screens/WelcomeScreen';
import { DemoNavigator, DemoTabParamList } from './DemoNavigator';
import { NavigatorScreenParams } from '@react-navigation/native';
import { Text } from '@/components/lib/Text';
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack"

export type DrawNavigatorParamList = {
  DrawerItems: undefined;
  DrawerWelcome: undefined;
  DrawerDemo: NavigatorScreenParams<DemoTabParamList>
};

const MyDrawer = createDrawerNavigator<DrawNavigatorParamList>();

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<DrawNavigatorParamList>()

function DrawerContent(props: DrawerContentComponentProps) {
  return (
    <MainDrawerWrapper drawerData={[]}>
      <DrawerItemList {...props} />
      <Text text='hello'/>
    </MainDrawerWrapper>
  );
}

export const DrawerNavigator = () => {
  return (
    <MainDrawerWrapper drawerData={[]}>

    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DrawerItems" component={ItemsScreen} />
      <Stack.Screen name="DrawerDemo" component={DemoNavigator} />
    </Stack.Navigator>
    </MainDrawerWrapper>

  );
};