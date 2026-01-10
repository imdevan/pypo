import { useEffect } from "react"

/**
 * Temporary hook for screen mount verification during navigation stability fixes.
 * Logs when a screen mounts and unmounts to help identify duplicate mounts.
 *
 * @param screenName - The name of the screen for logging purposes
 */
export const useScreenMountLog = (screenName: string) => {
  useEffect(() => {
    console.log(`${screenName} screen mounted`)
    return () => console.log(`${screenName} screen unmounted`)
  }, [screenName])
}
