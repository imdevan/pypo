import { FC } from "react"
import { TextStyle, View, ViewStyle } from "react-native"

import { IconTypes } from "@/components/lib/Icon"
import { ListItem } from "@/components/lib/ListItem"
import { Text } from "@/components/lib/Text"
import { isRTL } from "@/i18n"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { openLinkInBrowser } from "@/utils/openLinkInBrowser"

export const DevelopmentLinks: FC = () => {
  const { themed } = useAppTheme()

  const devLinks: Array<{
    title: string
    description: string
    url: string
    icon: IconTypes
  }> = [
    {
      title: "API Documentation",
      description: "Interactive documentation with Swagger UI",
      url: "http://localhost:8000/docs",
      icon: "view",
    },
    {
      title: "Backend API",
      description: "JSON based web API based on OpenAPI",
      url: "http://localhost:8000",
      icon: "components",
    },
    {
      title: "Traefik UI",
      description: "Proxy route management interface",
      url: "http://localhost:8090",
      icon: "debug",
    },
  ]

  return (
    <View style={themed($devLinksContainer)}>
      <Text preset="heading" text="Development Environment" style={themed($devLinksTitle)} />
      <Text
        text="Quick access to development tools and services"
        style={themed($devLinksSubtitle)}
      />

      {devLinks.map((link, index) => (
        <View key={index} style={themed($devLinkItem)}>
          <ListItem
            height={40}
            text={link.title}
            leftIcon={link.icon}
            rightIcon={isRTL ? "caretLeft" : "caretRight"}
            onPress={() => openLinkInBrowser(link.url)}
          />
          <Text text={link.description} style={themed($devLinkDescription)} />
        </View>
      ))}
    </View>
  )
}

const $devLinksContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xxl,
})

const $devLinksTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
})

const $devLinksSubtitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $devLinkItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $devLinkDescription: ThemedStyle<TextStyle> = ({ spacing }) => ({
  fontSize: 12,
  opacity: 0.7,
})
