/* eslint-disable react/jsx-key */
import { TextStyle, View, ViewStyle } from "react-native"

import { Icon } from "@/components/lib/Icon"
import { ListItem } from "@/components/lib/ListItem"
import { ListView } from "@/components/lib/ListView"
import { Text } from "@/components/lib/Text"
import { translate } from "@/i18n/translate"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"

import { DemoDivider } from "../DemoDivider"
import { Demo } from "../DemoShowroomScreen"
import { DemoUseCase } from "../DemoUseCase"

const listData =
  `Tempor Id Ea Aliqua Pariatur Aliquip. Irure Minim Voluptate Consectetur Consequat Sint Esse Proident Irure. Nostrud Elit Veniam Nostrud Excepteur Minim Deserunt Quis Dolore Velit Nulla Irure Voluptate Tempor. Occaecat Amet Laboris Nostrud Qui Do Quis Lorem Ex Elit Fugiat Deserunt. In Pariatur Excepteur Exercitation Ex Incididunt Qui Mollit Dolor Sit Non. Culpa Officia Minim Cillum Exercitation Voluptate Proident Laboris Et Est Reprehenderit Quis Pariatur Nisi`
    .split(".")
    .map((item) => item.trim())

const $customLeft: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.error,
  flexGrow: 0,
  flexBasis: 60,
  height: "100%",
  flexWrap: "wrap",
  overflow: "hidden",
})

const $customTextStyle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.error,
})

const $customTouchableStyle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.error,
})

const $customContainerStyle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderTopWidth: 5,
  borderTopColor: colors.palette.neutral100,
})

const $listStyle: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  height: 148,
  paddingHorizontal: spacing.xs,
  backgroundColor: colors.palette.neutral200,
})

export const DemoListItem: Demo = {
  name: "ListItem",
  description: "demoListItem:description",
  data: ({ theme, themed }) => [
    <DemoUseCase
      name="demoListItem:useCase.height.name"
      description="demoListItem:useCase.height.description"
    >
      <ListItem topSeparator>{translate("demoListItem:useCase.height.defaultHeight")}</ListItem>

      <ListItem topSeparator height={100}>
        {translate("demoListItem:useCase.height.customHeight")}
      </ListItem>

      <ListItem topSeparator>{translate("demoListItem:useCase.height.textHeight")}</ListItem>

      <ListItem topSeparator bottomSeparator TextProps={{ numberOfLines: 1 }}>
        {translate("demoListItem:useCase.height.longText")}
      </ListItem>
    </DemoUseCase>,

    <DemoUseCase
      name="demoListItem:useCase.separators.name"
      description="demoListItem:useCase.separators.description"
    >
      <ListItem topSeparator>{translate("demoListItem:useCase.separators.topSeparator")}</ListItem>

      <DemoDivider size={40} />

      <ListItem topSeparator bottomSeparator>
        {translate("demoListItem:useCase.separators.topAndBottomSeparator")}
      </ListItem>

      <DemoDivider size={40} />

      <ListItem bottomSeparator>
        {translate("demoListItem:useCase.separators.bottomSeparator")}
      </ListItem>
    </DemoUseCase>,

    <DemoUseCase
      name="demoListItem:useCase.icons.name"
      description="demoListItem:useCase.icons.description"
    >
      <ListItem topSeparator LeftComponent={<Icon name="star" size={24} />}>
        {translate("demoListItem:useCase.icons.leftIcon")}
      </ListItem>

      <ListItem topSeparator RightComponent={<Icon name="star" size={24} />}>
        {translate("demoListItem:useCase.icons.rightIcon")}
      </ListItem>

      <ListItem
        topSeparator
        bottomSeparator
        RightComponent={<Icon name="star" size={24} />}
        LeftComponent={<Icon name="star" size={24} />}
      >
        {translate("demoListItem:useCase.icons.leftRightIcons")}
      </ListItem>
    </DemoUseCase>,

    <DemoUseCase
      name="demoListItem:useCase.customLeftRight.name"
      description="demoListItem:useCase.customLeftRight.description"
    >
      <ListItem
        topSeparator
        LeftComponent={
          <View style={themed([$styles.row, $customLeft, { marginEnd: theme.spacing.md }])}>
            {Array.from({ length: 9 }, (x, i) => i).map((i) => (
              <Icon key={i} name="star" color={theme.colors.palette.neutral100} size={20} />
            ))}
          </View>
        }
      >
        {translate("demoListItem:useCase.customLeftRight.customLeft")}
      </ListItem>

      <ListItem
        topSeparator
        bottomSeparator
        RightComponent={
          <View style={themed([$styles.row, $customLeft, { marginStart: theme.spacing.md }])}>
            {Array.from({ length: 9 }, (x, i) => i).map((i) => (
              <Icon key={i} name="star" color={theme.colors.palette.neutral100} size={20} />
            ))}
          </View>
        }
      >
        {translate("demoListItem:useCase.customLeftRight.customRight")}
      </ListItem>
    </DemoUseCase>,

    <DemoUseCase
      name="demoListItem:useCase.passingContent.name"
      description="demoListItem:useCase.passingContent.description"
    >
      <ListItem topSeparator text={translate("demoListItem:useCase.passingContent.children")} />
      <ListItem topSeparator tx="demoShowroomScreen:demoViaTxProp" />
      <ListItem topSeparator>{translate("demoListItem:useCase.passingContent.children")}</ListItem>
      <ListItem topSeparator bottomSeparator>
        <Text>
          <Text preset="bold">
            {translate("demoListItem:useCase.passingContent.nestedChildren1")}
          </Text>
          {` `}
          <Text preset="default">
            {translate("demoListItem:useCase.passingContent.nestedChildren2")}
          </Text>
        </Text>
      </ListItem>
    </DemoUseCase>,

    <DemoUseCase
      name="demoListItem:useCase.listIntegration.name"
      description="demoListItem:useCase.listIntegration.description"
    >
      <View style={themed($listStyle)}>
        <ListView<string>
          data={listData}
          estimatedItemSize={59}
          renderItem={({ item, index }) => (
            <ListItem
              text={item}
              RightComponent={<Icon name="chevron-right" size={24} />}
              TextProps={{ numberOfLines: 1 }}
              topSeparator={index !== 0}
            />
          )}
        />
      </View>
    </DemoUseCase>,

    <DemoUseCase
      name="demoListItem:useCase.styling.name"
      description="demoListItem:useCase.styling.description"
    >
      <ListItem topSeparator textStyle={themed($customTextStyle)}>
        {translate("demoListItem:useCase.styling.styledText")}
      </ListItem>

      <ListItem
        topSeparator
        textStyle={{ color: theme.colors.palette.neutral100 }}
        style={themed($customTouchableStyle)}
      >
        {translate("demoListItem:useCase.styling.styledText")}
      </ListItem>

      <ListItem
        topSeparator
        textStyle={{ color: theme.colors.palette.neutral100 }}
        style={themed($customTouchableStyle)}
        containerStyle={themed($customContainerStyle)}
      >
        {translate("demoListItem:useCase.styling.styledContainer")}
      </ListItem>
      <ListItem
        topSeparator
        textStyle={{ color: theme.colors.palette.neutral100 }}
        style={themed($customTouchableStyle)}
        containerStyle={themed($customContainerStyle)}
        RightComponent={<Icon name="star" size={24} color={theme.colors.palette.neutral100} />}
        LeftComponent={<Icon name="star" size={24} color={theme.colors.palette.neutral100} />}
      >
        {translate("demoListItem:useCase.styling.tintedIcons")}
      </ListItem>
    </DemoUseCase>,
  ],
}
