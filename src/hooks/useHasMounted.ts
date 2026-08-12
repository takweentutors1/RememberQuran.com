import { useSyncExternalStore } from "react"

// Value never changes post-mount, so subscribe is a no-op — this only
// exists to get the correct getServerSnapshot/getSnapshot split for a
// hydration-safe "has this rendered on the client yet" flag, without the
// extra render+effect+setState waterfall the old useState+useEffect(() =>
// setMounted(true)) pattern caused.
function subscribe() {
  return () => {}
}

function getSnapshot() {
  return true
}

function getServerSnapshot() {
  return false
}

/** True once mounted on the client — false during SSR and the first client render. */
export function useHasMounted(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
