'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PWAInstall from './PWAInstall'


export default function Navbar() {
  const router = useRouter()
  const [userName, setUserName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()
        setUserName(profile?.full_name || user.email || 'Student')
      }
      setLoading(false)
    }
    getUser()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      <nav style={{ background: 'var(--green)', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ color: '#fff', fontSize: '20px', fontWeight: 500, letterSpacing: '-0.02em' }}>
          Sua <span style={{ color: 'var(--gold)' }}>Yie</span>
        </Link>

        {!loading && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {userName ? (
              <>
                <Link href="/leaderboard" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '16px' }}>
                  🏆
                </Link>
                <Link href="/progress" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '16px' }}>
                  📈
                </Link>
                <Link href="/dashboard" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', fontWeight: 500 }}>
                  Hi, {userName.split(' ')[0]}
                </Link>
                <button
                  onClick={handleLogout}
                  style={{ padding: '7px 14px', borderRadius: '7px', border: '1.5px solid rgba(255,255,255,0.55)', color: '#fff', fontSize: '14px', fontWeight: 500, background: 'transparent' }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" style={{ padding: '7px 14px', borderRadius: '7px', border: '1.5px solid rgba(255,255,255,0.55)', color: '#fff', fontSize: '14px', fontWeight: 500 }}>
                  Log in
                </Link>
                <Link href="/signup" style={{ padding: '7px 14px', borderRadius: '7px', background: 'var(--gold)', color: '#3D2B00', fontSize: '14px', fontWeight: 500 }}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
      <div style={{ height: '4px', background: 'var(--gold)' }} />
      <PWAInstall />
    </>
  )
}