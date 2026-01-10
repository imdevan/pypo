/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import { ComponentProps } from "react"
import { useEffect, useState } from "react"
import * as Linking from "expo-linking"
import { NavigationContainer, NavigatorScreenParams } from "@react-navigation/native"
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack"

import Config from "@/config"
import { useAuth } from "@/context/AuthContext"
import { ErrorBoundary } from "@/screens/ErrorScreen/ErrorBoundary"
import { LoginScreen } from "@/screens/LoginScreen"
import { WelcomeScreen } from "@/screens/WelcomeScreen"
import { useAppTheme } from "@/theme/context"

import { DrawerNavigator, DrawNavigatorParamList } from "./DrawerNavigator"
import { navigationRef, useBackButtonHandler } from "./navigationUtilities"

/**
 * Root navigator param list - contains both auth and app flows as screens
 */
export type RootStackParamList = {
  AuthFlow: undefined
  AppFlow: undefined
}

/**
 * Auth stack param list - screens for unauthenticated users
 */
export type AuthStackParamList = {
  Login: undefined
}

/**
 * App stack param list - screens for authenticated users
 */
export type AppStackParamList = {
  Welcome: undefined
  app: NavigatorScreenParams<DrawNavigatorParamList>
  // 🔥 Your screens go here
  // IGNITE_GENERATOR_ANCHOR_APP_STACK_PARAM_LIST
}

/**
 * This is a list of all the route names that will exit the app if the back button
 * is pressed while in that screen. Only affects Android.
 */
const exitRoutes = Config.exitRoutes

export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>

// Navigator factories - one per flow to prevent identity instability
// Documentation: https://reactnavigation.org/docs/stack-navigator/
const RootStack = createNativeStackNavigator<RootStackParamList>()
const AuthStack = createNativeStackNavigator<AuthStackParamList>()
const AppStack = createNativeStackNavigator<AppStackParamList>()

// Auth flow - screens for unauthenticated users
const AuthFlow = () => {
  const {
    theme: { colors },
  } = useAppTheme()

  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        navigationBarColor: colors.background,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
      initialRouteName="Login"
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  )
}

// App flow - screens for authenticated users
const AppFlow = () => {
  const [isReady, setIsReady] = useState(false)
  const [initialRoute, setInitialRoute] = useState<keyof AppStackParamList>("app")
  const {
    theme: { colors },
  } = useAppTheme()

  useEffect(() => {
    const prepareNavigation = async () => {
      try {
        // Check if there's an initial URL
        const initialUrl = await Linking.getInitialURL()

        if (initialUrl) {
          // If there's a deep link, let the linking configuration handle it
          // Don't set an initial route
          setInitialRoute("app")
        } else {
          // For authenticated users without a specific URL, default to app
          // The navigation state will be restored from persistence
          setInitialRoute("app")
        }
      } finally {
        setIsReady(true)
      }
    }

    prepareNavigation()
  }, [])

  if (!isReady) {
    return null
  }

  return (
    <AppStack.Navigator
      screenOptions={{
        headerShown: false,
        navigationBarColor: colors.background,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
      initialRouteName={initialRoute}
    >
      <AppStack.Screen name="Welcome" component={WelcomeScreen} />
      <AppStack.Screen name="app" component={DrawerNavigator} />
    </AppStack.Navigator>
  )
}

// Root navigator - always exists, conditionally shows AuthFlow or AppFlow
const RootNavigator = () => {
  const { isAuthenticated } = useAuth()
  const {
    theme: { colors },
  } = useAppTheme()

  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        navigationBarColor: colors.background,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
      initialRouteName={isAuthenticated ? "AppFlow" : "AuthFlow"}
    >
      <RootStack.Screen name="AuthFlow" component={AuthFlow} />
      <RootStack.Screen name="AppFlow" component={AppFlow} />
    </RootStack.Navigator>
  )
}

export interface NavigationProps
  extends Partial<ComponentProps<typeof NavigationContainer<RootStackParamList>>> {}

export const AppNavigator = (props: NavigationProps) => {
  const { navigationTheme } = useAppTheme()
  const { isAuthenticated } = useAuth()

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

  // Navigate to the appropriate flow when auth state changes
  useEffect(() => {
    if (!navigationRef.isReady()) return

    if (isAuthenticated) {
      navigationRef.navigate("AppFlow")
    } else {
      navigationRef.navigate("AuthFlow")
    }
  }, [isAuthenticated])

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme} {...props}>
      <ErrorBoundary catchErrors={Config.catchErrors}>
        <RootNavigator />
      </ErrorBoundary>
    </NavigationContainer>
  )
}
