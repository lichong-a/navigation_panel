'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { ThreeBackground } from '@/components/three/ThreeBackground'
import { GroupList } from '@/components/features/GroupList'
import { useSitesStore } from '@/stores/sites'
import { api } from '@/lib/api'

export default function HomePage() {
  const router = useRouter()
  const { setData, setLoading, isLoading } = useSitesStore()
  const [checkingInit, setCheckingInit] = useState(true)

  useEffect(() => {
    // 检查是否已初始化
    api.getSetupStatus()
      .then((status) => {
        if (!status.initialized) {
          router.replace('/setup')
          return
        }
        setCheckingInit(false)
        // 加载数据
        setLoading(true)
        return api.getSites()
      })
      .then((data) => {
        if (data) {
          setData(data as any)
        }
      })
      .catch(console.error)
  }, [router, setData, setLoading])

  if (checkingInit || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-purple-600 animate-pulse" />
          <p className="text-[var(--color-text-muted)]">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <ThreeBackground />
      <div className="min-h-screen relative pt-16">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <GroupList />
        </main>
      </div>
    </>
  )
}
