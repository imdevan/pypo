import "@expo/metro-runtime" // this is for fast refresh on web w/o expo-router
import { registerRootComponent } from "expo"

import { App } from "@/app"

// Set up why-did-you-render for development
if (__DEV__ && process.env.__WDYR__) {
  const whyDidYouRender = require("@welldone-software/why-did-you-render")
  const React = require("react")

  whyDidYouRender(React, {
    trackAllPureComponents: false,
    trackHooks: true,
    logOnDifferentValues: true,
    collapseGroups: true,
    include: [/ItemsScreen/, /ItemCard/, /useItems/],
    exclude: [/^Internal/, /^RCT/, /^Expo/],
  })
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App)
