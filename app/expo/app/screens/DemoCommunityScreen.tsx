import { FC } from "react"
import { TextStyle } from "react-native"

import { ListItem } from "@/components/lib/ListItem"
import { Screen } from "@/components/lib/Screen"
import { Text } from "@/components/lib/Text"
import { isRTL } from "@/i18n"
import { DemoTabScreenProps, useTabBarSpacing } from "@/navigators/TabNavigator"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"
import { openLinkInBrowser } from "@/utils/openLinkInBrowser"

export const DemoCommunityScreen: FC<DemoTabScreenProps<"community">> =
  function DemoCommunityScreen(_props) {
    const { themed } = useAppTheme()
    const { paddingBottom } = useTabBarSpacing()
    return (
      <Screen
        preset="scroll"
        contentContainerStyle={[themed($styles.container), { paddingBottom }]}
      >
        <Text preset="heading" tx="demoCommunityScreen:title" style={themed($title)} />

        <Text
          preset="subheading"
          tx="demoCommunityScreen:makePyPoBetterTitle"
          style={themed($sectionTitle)}
        />
        <Text tx="demoCommunityScreen:makePyPoBetter" style={themed($description)} />
        <ListItem
          tx="demoCommunityScreen:contributeToPyPoLink"
          leftIcon="github"
          rightIcon={isRTL ? "caretLeft" : "caretRight"}
          onPress={() => openLinkInBrowser("https://github.com/imdevan/PyPo")}
        />

        <Text
          preset="subheading"
          tx="demoCommunityScreen:linkBackTitle"
          style={themed($sectionTitle)}
        />
        <Text tx="demoCommunityScreen:linkBack" style={themed($description)} />
        <ListItem
          tx="demoCommunityScreen:igniteLink"
          bottomSeparator
          leftIcon="github"
          rightIcon={isRTL ? "caretLeft" : "caretRight"}
          onPress={() => openLinkInBrowser("https://github.com/infinitered/ignite")}
        />
        <ListItem
          tx="demoCommunityScreen:fastApiLink"
          rightIcon={isRTL ? "caretLeft" : "caretRight"}
          leftIcon="github"
          onPress={() =>
            openLinkInBrowser("https://github.com/fastapi/full-stack-fastapi-template")
          }
        />

        <Text
          preset="subheading"
          tx="demoCommunityScreen:workWithMeTitle"
          style={themed($sectionTitle)}
        />
        <Text tx="demoCommunityScreen:workWithMe" style={themed($description)} />
        <ListItem
          tx="demoCommunityScreen:getInTouchLink"
          leftIcon="clap"
          rightIcon={isRTL ? "caretLeft" : "caretRight"}
          onPress={() => openLinkInBrowser("https://devanhuapaya.com/contact")}
        />
      </Screen>
    )
  }

const $title: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
})

const $description: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginTop: spacing.xxl,
})
