import { useEffect, useRef } from "react"

/**
 * Temporary hook for mount verification during navigation stability fixes.
 * Logs when a component mounts, unmounts, and re-renders to help identify duplicate mounts.
 * Can be used for screens, navigators, wrappers, or any component.
 *
 * @param componentName - The name of the component for logging purposes
 * @param options - Optional configuration
 */
export const useMountLog = (
  componentName: string,
  options?: { includeStackTrace?: boolean; logRenders?: boolean },
) => {
  const mountCountRef = useRef(0)
  const renderCountRef = useRef(0)
  const mountIdRef = useRef<string | null>(null)
  const { includeStackTrace = true, logRenders = false } = options || {}

  // Track renders (runs on every render)
  useEffect(() => {
    renderCountRef.current += 1
    if (mountIdRef.current && logRenders) {
      console.log(
        `[RENDER #${renderCountRef.current}] ${componentName} re-rendered (ID: ${mountIdRef.current})`,
      )
    }
  })

  // Track mounts/unmounts (runs only on mount/unmount)
  useEffect(() => {
    mountCountRef.current += 1
    if (!mountIdRef.current) {
      mountIdRef.current = `${componentName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const mountId = mountIdRef.current
      const stackTrace = includeStackTrace
        ? new Error().stack?.split("\n").slice(2, 6).join("\n") || ""
        : ""

      console.log(
        `[MOUNT #${mountCountRef.current}] ${componentName} mounted`,
        `\n  ID: ${mountId}`,
        ...(includeStackTrace ? [`\n  Stack: ${stackTrace}`] : []),
      )
    }

    return () => {
      console.log(`[UNMOUNT] ${componentName} unmounted (ID: ${mountIdRef.current})`)
      mountIdRef.current = null
      renderCountRef.current = 0
    }
  }, [componentName, includeStackTrace])
}
