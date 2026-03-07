import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'

// This route is called by Vercel Cron every 2 days
// Configure in vercel.json: {"crons": [{"path": "/api/cron/reminder", "schedule": "0 9 */2 * *"}]}

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = await createAdminSupabaseClient()

    // Check if there are any active iterations
    const { data: activeIterations, error } = await supabase
      .from('iterations')
      .select('id, crop_name, setups(setup_name)')
      .eq('status', 'active')

    if (error) throw error
    if (!activeIterations || activeIterations.length === 0) {
      return NextResponse.json({ message: 'No active iterations. No notifications sent.' })
    }

    // Get all employee FCM tokens from user metadata
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
    if (usersError) throw usersError

    const tokens: string[] = users
      .map((u: any) => u.user_metadata?.fcm_token)
      .filter(Boolean)

    if (tokens.length === 0) {
      return NextResponse.json({ message: 'No FCM tokens registered.' })
    }

    // Send via Firebase Admin (FCM HTTP v1)
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/messages:send`
    
    const iterationNames = activeIterations
      .slice(0, 3)
      .map((i: any) => i.crop_name)
      .join(', ')

    const results = await Promise.allSettled(
      tokens.map(async (token) => {
        const res = await fetch(fcmUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await getFirebaseAccessToken()}`,
          },
          body: JSON.stringify({
            message: {
              token,
              notification: {
                title: '🌱 Hydroponic Data Reminder',
                body:  `Please log TDS & pH readings for: ${iterationNames}`,
              },
              webpush: {
                fcm_options: { link: '/dashboard' },
                notification: {
                  icon:  '/icons/icon-192x192.png',
                  badge: '/icons/badge-72x72.png',
                },
              },
            },
          }),
        })
        return res.json()
      })
    )

    const sent    = results.filter((r) => r.status === 'fulfilled').length
    const failed  = results.filter((r) => r.status === 'rejected').length

    return NextResponse.json({
      success: true,
      activeIterations: activeIterations.length,
      notificationsSent: sent,
      failed,
    })
  } catch (err: any) {
    console.error('Cron error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Get Firebase access token using service account
async function getFirebaseAccessToken(): Promise<string> {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}')
  
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
  }

  // Create JWT (simplified — in production use google-auth-library)
  const header  = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const body    = btoa(JSON.stringify(payload))
  const message = `${header}.${body}`

  // Exchange for access token
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion:  message,
    }),
  })

  const data = await res.json()
  return data.access_token
}
