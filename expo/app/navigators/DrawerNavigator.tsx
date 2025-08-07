import { Items } from '@/client';
import { createDrawerNavigator, DrawerContentComponentProps } from '@react-navigation/drawer';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { ItemsScreen } from '@/screens/ItemsScreen';
import { WelcomeScreen } from '@/screens/WelcomeScreen';
import { DemoNavigator, DemoTabParamList } from './DemoNavigator';
import { NavigatorScreenParams } from '@react-navigation/native';
import { Text } from '@/components/lib/Text';

export type DrawNavigatorParamList = {
  DrawerItems: undefined;
  DrawerWelcome: undefined;
  Demo: NavigatorScreenParams<DemoTabParamList>
};

const MyDrawer = createDrawerNavigator<DrawNavigatorParamList>();

function DrawerContent(props: DrawerContentComponentProps) {
  return (
    <DrawerContentScrollView >
      <DrawerItemList {...props} />
      <Text text='hello'/>
    </DrawerContentScrollView>
  );
}

export const DrawerNavigator = () => {
  return (
    <MyDrawer.Navigator drawerContent={DrawerContent}>
      <MyDrawer.Screen name="DrawerItems" component={ItemsScreen} />
      <MyDrawer.Screen name="Demo" component={DemoNavigator} />
    </MyDrawer.Navigator>
  );
};