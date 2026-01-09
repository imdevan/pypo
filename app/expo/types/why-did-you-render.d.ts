/**
 * TypeScript declarations for why-did-you-render
 */
import { ComponentType } from "react"

declare module "react" {
  interface Component<P = {}, S = {}, SS = any> {
    whyDidYouRender?: boolean | {
      logOnDifferentValues?: boolean
      customName?: string
    }
  }
}

declare module "@welldone-software/why-did-you-render" {
  interface WhyDidYouRenderOptions {
    trackAllPureComponents?: boolean
    trackHooks?: boolean
    trackExtraHooks?: Array<[any, string]>
    logOnDifferentValues?: boolean
    logOwnerReasons?: boolean
    hotReloadBufferMs?: number
    onlyLogs?: boolean
    collapseGroups?: boolean
    include?: RegExp[]
    exclude?: RegExp[]
    titleColor?: string
    diffNameColor?: string
    diffPathColor?: string
    textBackgroundColor?: string
  }

  function whyDidYouRender(React: any, options?: WhyDidYouRenderOptions): void

  export default whyDidYouRender
}

