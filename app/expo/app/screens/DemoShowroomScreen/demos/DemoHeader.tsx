/* eslint-disable react/jsx-key, react-native/no-inline-styles */
import { TextStyle, View, ViewStyle } from "react-native"

import { Header } from "@/components/lib/Header"
import { Icon } from "@/components/lib/Icon"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"

import { DemoDivider } from "../DemoDivider"
import { Demo } from "../DemoShowroomScreen"
import { DemoUseCase } from "../DemoUseCase"

const $rightAlignTitle: TextStyle = {
  textAlign: "right",
}

const $customLeftAction: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.error,
  flexGrow: 0,
  flexBasis: 100,
  height: "100%",
  flexWrap: "wrap",
  overflow: "hidden",
})

const $customTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  textDecorationLine: "underline line-through",
  textDecorationStyle: "dashed",
  color: colors.error,
  textDecorationColor: colors.error,
})

const $customWhiteTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
})

export const DemoHeader: Demo = {
  name: "Header",
  description: "demoHeader:description",
  data: ({ theme, themed }) => [
    <DemoUseCase
      name="demoHeader:useCase.actionIcons.name"
      description="demoHeader:useCase.actionIcons.description"
    >
      <Header
        titleTx="demoHeader:useCase.actionIcons.leftIconTitle"
        LeftActionComponent={<Icon name="star" size={24} />}
        safeAreaEdges={[]}
      />
      <DemoDivider size={24} />
      <Header
        titleTx="demoHeader:useCase.actionIcons.rightIconTitle"
        RightActionComponent={<Icon name="star" size={24} />}
        safeAreaEdges={[]}
      />
      <DemoDivider size={24} />
      <Header
        titleTx="demoHeader:useCase.actionIcons.bothIconsTitle"
        LeftActionComponent={<Icon name="star" size={24} />}
        RightActionComponent={<Icon name="star" size={24} />}
        safeAreaEdges={[]}
      />
    </DemoUseCase>,

    <DemoUseCase
      name="demoHeader:useCase.actionText.name"
      description="demoHeader:useCase.actionText.description"
    >
      <Header
        titleTx="demoHeader:useCase.actionText.leftTxTitle"
        leftTx="demoShowroomScreen:demoHeaderTxExample"
        safeAreaEdges={[]}
      />
      <DemoDivider size={24} />
      <Header
        titleTx="demoHeader:useCase.actionText.rightTextTitle"
        rightText="Yay"
        safeAreaEdges={[]}
      />
    </DemoUseCase>,

    <DemoUseCase
      name="demoHeader:useCase.customActionComponents.name"
      description="demoHeader:useCase.customActionComponents.description"
    >
      <Header
        titleTx="demoHeader:useCase.customActionComponents.customLeftActionTitle"
        titleMode="flex"
        titleStyle={$rightAlignTitle}
        LeftActionComponent={
          <View style={themed([$styles.row, $customLeftAction])}>
            {Array.from({ length: 20 }, (x, i) => i).map((i) => (
              <Icon key={i} name="star" color={theme.colors.palette.neutral100} size={20} />
            ))}
          </View>
        }
        safeAreaEdges={[]}
      />
    </DemoUseCase>,

    <DemoUseCase
      name="demoHeader:useCase.titleModes.name"
      description="demoHeader:useCase.titleModes.description"
    >
      <Header
        titleTx="demoHeader:useCase.titleModes.centeredTitle"
        LeftActionComponent={<Icon name="star" size={24} />}
        rightText="Hooray"
        safeAreaEdges={[]}
      />
      <DemoDivider size={24} />
      <Header
        titleTx="demoHeader:useCase.titleModes.flexTitle"
        titleMode="flex"
        LeftActionComponent={<Icon name="star" size={24} />}
        rightText="Hooray"
        safeAreaEdges={[]}
      />
    </DemoUseCase>,

    <DemoUseCase
      name="demoHeader:useCase.styling.name"
      description="demoHeader:useCase.styling.description"
    >
      <Header
        titleTx="demoHeader:useCase.styling.styledTitle"
        titleStyle={themed($customTitle)}
        safeAreaEdges={[]}
      />
      <DemoDivider size={24} />
      <Header
        titleTx="demoHeader:useCase.styling.styledWrapperTitle"
        titleStyle={themed($customWhiteTitle)}
        backgroundColor={theme.colors.error}
        style={{ height: 35 }}
        safeAreaEdges={[]}
      />
      <DemoDivider size={24} />
      <Header
        titleTx="demoHeader:useCase.styling.tintedIconsTitle"
        titleStyle={themed($customWhiteTitle)}
        backgroundColor={theme.colors.error}
        LeftActionComponent={<Icon name="star" size={24} color={theme.colors.palette.neutral100} />}
        safeAreaEdges={[]}
      />
    </DemoUseCase>,
  ],
}
