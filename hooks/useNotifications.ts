'use client'

import { useEffect, useState } from 'react'
import { requestNotificationPermission, onForegroundMessage } from '@/lib/firebase'
import { createClient } from '@/lib/supabase-client'

export function useNotifications(userId?: string) {
  const [token, setToken]       = useState<string | null>(null)
  const [granted, setGranted]   = useState(false)
  const supabase                = createClient()

  const enable = async () => {
    const t = await requestNotificationPermission()
    if (t && userId) {
      setToken(t)
      setGranted(true)
      // Store FCM token in user metadata
      await supabase.auth.updateUser({
        data: { fcm_token: t }
      })
    }
  }

  useEffect(() => {
    if (!userId) return
    const unsub = onForegroundMessage((payload) => {
      // Show in-app toast for foreground messages
      if (payload.notification) {
        console.log('FCM foreground message:', payload.notification)
      }
    })
    return () => unsub()
  }, [userId])

  return { token, granted, enable }
}
