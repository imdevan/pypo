import { forwardRef, ForwardedRef } from "react"
// eslint-disable-next-line no-restricted-imports
import { View, ViewProps } from "react-native"

import { DebugMode, useDebugStore } from "@/stores/debugStore"

export interface DVProps extends ViewProps {
  debugLevel?: DebugMode
}

/**
 * Debug View
 * A view that only renders if the debug mode is enabled.
 * @param props - The props for the DebugView component.
 * @param ref - The ref for the DebugView component.
 * @returns The DebugView component.
 */
export const DebugView = forwardRef(function DebugView(
  { ...props }: DVProps,
  ref: ForwardedRef<View>,
) {
  const { isDebugEnabled } = useDebugStore()

  if (!isDebugEnabled()) {
    return null
  }

  return <View {...props} ref={ref} />
})
