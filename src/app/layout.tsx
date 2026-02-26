import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: 'RicPanel - 个人导航面板',
  description: '一个简洁美观的个人导航网站，充满动效和3D效果',
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#6366f1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
