'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Input, Button } from '@/components/ui'
import { api } from '@/lib/api'
import { Sparkles, Shield, ArrowRight, CheckCircle } from 'lucide-react'

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.getSetupStatus().then((status) => {
      if (status.initialized) {
        router.replace('/')
      }
    })
  }, [router])

  useEffect(() => {
    if (step !== 3) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !loading) {
        handleSubmit()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [step, loading])

  const validateUsername = () => {
    if (username.length < 3) {
      setError('用户名至少需要 3 个字符')
      return false
    }
    return true
  }

  const validatePassword = () => {
    if (password.length < 6) {
      setError('密码至少需要 6 个字符')
      return false
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return false
    }
    return true
  }

  const handleNext = () => {
    setError('')
    if (step === 1 && validateUsername()) {
      setStep(2)
    } else if (step === 2 && validatePassword()) {
      setStep(3)
    }
  }

  const handleSubmit = async () => {
    if (!validateUsername() || !validatePassword()) return

    setLoading(true)
    try {
      await api.initSetup(username, password)
      setStep(4)
      setTimeout(() => router.replace('/'), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '初始化失败')
      setStep(3)
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const } }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-6 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[var(--color-primary)]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-primary)]/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-xl relative z-10"
      >
        {/* Logo 和标题 */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.8, delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-6 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] via-purple-500 to-pink-500 rounded-2xl rotate-6 opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-[var(--color-primary)]/30">
              <span className="text-white font-black text-3xl tracking-tight" style={{ fontFamily: 'system-ui' }}>N</span>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-2 border-2 border-dashed border-[var(--color-primary)]/30 rounded-2xl"
            />
          </motion.div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-[var(--color-text)] to-[var(--color-text-muted)] bg-clip-text text-transparent mb-3">
            欢迎使用 RicPanel
          </h1>
          <p className="text-base text-[var(--color-text-muted)] leading-relaxed">
            让我们开始设置您的个人导航面板
          </p>
        </motion.div>

        {/* 步骤指示器 */}
        <motion.div variants={itemVariants} className="flex justify-center items-center gap-3 mb-8">
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              animate={{
                scale: step === s ? 1.3 : 1,
                backgroundColor: step >= s ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
              }}
              className="w-2.5 h-2.5 rounded-full transition-colors"
            />
          ))}
        </motion.div>

        {/* 表单卡片 */}
        <motion.div
          variants={itemVariants}
          className="p-10 rounded-2xl bg-[var(--color-surface)]/80 backdrop-blur-xl border border-[var(--color-border)] shadow-2xl"
        >
          {/* 步骤 1: 用户名 */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-5 mb-6">
                <div className="p-4 rounded-xl bg-[var(--color-primary)]/20">
                  <Shield className="w-7 h-7 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[var(--color-text)]">设置用户名</h2>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1.5">这将用于管理员登录</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-[var(--color-text-muted)]">用户名</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && username.trim() && handleNext()}
                  placeholder="请输入用户名（至少 3 个字符）"
                  className="h-12 text-base px-4"
                  autoFocus
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-[var(--color-error)] py-3"
                >
                  {error}
                </motion.p>
              )}

              <Button
                onClick={handleNext}
                disabled={!username.trim()}
                className="w-full h-12 text-base gap-2 mt-2"
              >
                下一步
                <ArrowRight size={18} />
              </Button>
            </motion.div>
          )}

          {/* 步骤 2: 密码 */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-5 mb-6">
                <div className="p-4 rounded-xl bg-purple-500/20">
                  <Sparkles className="w-7 h-7 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[var(--color-text)]">设置密码</h2>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1.5">请设置一个安全的密码</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-[var(--color-text-muted)]">密码</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码（至少 6 个字符）"
                    className="h-12 text-base px-4"
                    autoFocus
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-[var(--color-text-muted)]">确认密码</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && password && confirmPassword && handleNext()}
                    placeholder="请再次输入密码"
                    className="h-12 text-base px-4"
                  />
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-[var(--color-error)] py-3"
                >
                  {error}
                </motion.p>
              )}

              <div className="flex gap-4 pt-3">
                <Button variant="secondary" onClick={() => setStep(1)} className="px-8 h-12 text-base">
                  返回
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!password || !confirmPassword}
                  className="flex-1 h-12 text-base gap-2"
                >
                  下一步
                  <ArrowRight size={18} />
                </Button>
              </div>
            </motion.div>
          )}

          {/* 步骤 3: 确认 */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center py-5">
                <h2 className="text-xl font-semibold text-[var(--color-text)] mb-3">确认设置</h2>
                <p className="text-sm text-[var(--color-text-muted)]">请确认您的管理员账户信息</p>
              </div>

              <div className="p-6 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] space-y-5">
                <div className="flex justify-between items-center py-4 border-b border-[var(--color-border)]">
                  <span className="text-sm text-[var(--color-text-muted)]">用户名</span>
                  <span className="font-semibold text-base text-[var(--color-text)]">{username}</span>
                </div>
                <div className="flex justify-between items-center py-4">
                  <span className="text-sm text-[var(--color-text-muted)]">密码</span>
                  <span className="font-semibold text-base text-[var(--color-text)]">{'•'.repeat(Math.min(password.length, 12))}</span>
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-[var(--color-error)] py-3"
                >
                  {error}
                </motion.p>
              )}

              <div className="flex gap-4 pt-3">
                <Button variant="secondary" onClick={() => setStep(2)} className="px-8 h-12 text-base">
                  返回
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 h-12 text-base gap-2"
                >
                  {loading ? '正在设置...' : '完成设置'}
                  {!loading && <Sparkles size={18} />}
                </Button>
              </div>
            </motion.div>
          )}

          {/* 步骤 4: 完成 */}
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-24 h-24 mx-auto mb-8 rounded-full bg-[var(--color-success)]/20 flex items-center justify-center"
              >
                <CheckCircle className="w-12 h-12 text-[var(--color-success)]" />
              </motion.div>
              <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-4">设置完成！</h2>
              <p className="text-base text-[var(--color-text-muted)]">正在跳转到主页...</p>
            </motion.div>
          )}
        </motion.div>

        {/* 底部提示 */}
        <motion.p
          variants={itemVariants}
          className="text-center text-sm text-[var(--color-text-muted)] mt-8"
        >
          RicPanel - 您的个人导航面板
        </motion.p>
      </motion.div>
    </div>
  )
}
