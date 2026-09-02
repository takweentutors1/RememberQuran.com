"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"

interface UseRemoteSetOptions {
  fetchKeys: () => Promise<Set<string>>
  onAdd: (key: string) => Promise<boolean | void>
  onDelete: (key: string) => Promise<boolean | void>
}

export interface RemoteSetHandle {
  loaded: boolean
  has: (key: string) => boolean
  isPending: (key: string) => boolean
  toggle: (key: string) => Promise<void>
  refresh: () => Promise<void>
  size: number
  keys: Set<string> | null
  setKeysDirect: React.Dispatch<React.SetStateAction<Set<string> | null>>
}

/**
 * Shared optimistic Set<string> + remote synchronization hook.
 * Handles user session changes, in-flight state tracking, and automatic rollback on network failure.
 */
export function useRemoteSet({
  fetchKeys,
  onAdd,
  onDelete,
}: UseRemoteSetOptions): RemoteSetHandle {
  const { data: session } = useSession()
  const userId = session?.user?.id ?? null

  const [keys, setKeys] = useState<Set<string> | null>(null)
  const [keysUserId, setKeysUserId] = useState<string | null>(null)
  const [pending, setPending] = useState<Set<string>>(new Set())

  const effectiveKeys = userId && keysUserId === userId ? keys : null

  const effectiveKeysRef = useRef<Set<string> | null>(null)
  const pendingRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    effectiveKeysRef.current = effectiveKeys
  })
  useEffect(() => {
    pendingRef.current = pending
  })

  useEffect(() => {
    let cancelled = false
    const fetchFor = userId

    Promise.resolve()
      .then(() => {
        if (cancelled) return
        setKeys(null)
        setKeysUserId(null)
        setPending(new Set())
        if (!fetchFor) return
        return fetchKeys()
      })
      .then((newKeys) => {
        if (cancelled || !newKeys || !fetchFor) return
        setKeys(newKeys)
        setKeysUserId(fetchFor)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [userId, fetchKeys])

  const refresh = useCallback(async () => {
    if (!userId) return
    try {
      const newKeys = await fetchKeys()
      setKeys(newKeys)
      setKeysUserId(userId)
    } catch {
      // Keep existing memory on network failure
    }
  }, [userId, fetchKeys])

  const has = useCallback(
    (key: string) => effectiveKeys?.has(key) ?? false,
    [effectiveKeys],
  )

  const isPending = useCallback(
    (key: string) => pending.has(key),
    [pending],
  )

  const toggle = useCallback(
    async (key: string) => {
      if (effectiveKeysRef.current === null) return
      if (pendingRef.current.has(key)) return
      const wasPresent = effectiveKeysRef.current.has(key)

      setPending((prev) => new Set(prev).add(key))
      setKeys((prev) => {
        const next = new Set(prev ?? [])
        if (wasPresent) next.delete(key)
        else next.add(key)
        return next
      })

      try {
        if (wasPresent) {
          await onDelete(key)
        } else {
          await onAdd(key)
        }
      } catch {
        // Rollback optimistic update
        setKeys((prev) => {
          const next = new Set(prev ?? [])
          if (wasPresent) next.add(key)
          else next.delete(key)
          return next
        })
      } finally {
        setPending((prev) => {
          const next = new Set(prev)
          next.delete(key)
          return next
        })
      }
    },
    [onAdd, onDelete],
  )

  return {
    loaded: effectiveKeys !== null,
    has,
    isPending,
    toggle,
    refresh,
    size: effectiveKeys?.size ?? 0,
    keys: effectiveKeys,
    setKeysDirect: setKeys,
  }
}
