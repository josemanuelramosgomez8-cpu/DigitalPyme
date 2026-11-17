import { useEffect } from "react"

export function useScrollLock(lock: boolean = true): void {
  useEffect(() => {
    if (!lock) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [lock])
}
