import { FC } from "react"
import { TextStyle, View, ViewStyle } from "react-native"

import { Icon } from "@/components/lib/Icon"
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
    iconName: string
  }> = [
    {
      title: "API Documentation",
      description: "Interactive documentation with Swagger UI",
      url: "http://localhost:8000/docs",
      iconName: "eye",
    },
    {
      title: "Backend API",
      description: "JSON based web API based on OpenAPI",
      url: "http://localhost:8000",
      iconName: "layers",
    },
    {
      title: "Traefik UI",
      description: "Proxy route management interface",
      url: "http://localhost:8090",
      iconName: "code",
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
            LeftComponent={<Icon name={link.iconName as any} size={24} />}
            RightComponent={<Icon name={isRTL ? "chevron-left" : "chevron-right"} size={24} />}
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

const $devLinkDescription: ThemedStyle<TextStyle> = () => ({
  fontSize: 12,
  opacity: 0.7,
})
