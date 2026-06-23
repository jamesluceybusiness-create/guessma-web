import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      `Supabase env vars missing. URL: ${url ? 'OK' : 'MISSING'}, KEY: ${key ? 'OK' : 'MISSING'}`
    )
  }

  const cleanUrl = url.trim().replace(/\/$/, '')
  const cleanKey = key.trim()

  return createBrowserClient(cleanUrl, cleanKey)
}
