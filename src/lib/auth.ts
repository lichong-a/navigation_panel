import { SignJWT, jwtVerify } from 'jose'
import { compare, hash } from 'bcryptjs'
import { readConfig, writeConfig } from './db'
import type { Config } from '@/types'

const JWT_ALG = 'HS256'

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return compare(password, hash)
}

export async function createToken(username: string, secret: string): Promise<string> {
  const secretKey = new TextEncoder().encode(secret)
  return new SignJWT({ username })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey)
}

export async function verifyToken(token: string, secret: string): Promise<{ username: string } | null> {
  try {
    const secretKey = new TextEncoder().encode(secret)
    const { payload } = await jwtVerify(token, secretKey)
    return payload as { username: string }
  } catch {
    return null
  }
}

export async function initializeAdmin(username: string, password: string): Promise<{ success: boolean; error?: string }> {
  const config = await readConfig()

  if (config.initialized) {
    return { success: false, error: 'Already initialized' }
  }

  if (!username || username.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters' }
  }

  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' }
  }

  const passwordHash = await hashPassword(password)

  const newConfig: Config = {
    ...config,
    initialized: true,
    admin: {
      username,
      passwordHash,
    },
    createdAt: Date.now(),
  }

  await writeConfig(newConfig)
  return { success: true }
}

export async function login(username: string, password: string): Promise<{ success: boolean; token?: string; error?: string }> {
  const config = await readConfig()

  if (!config.initialized) {
    return { success: false, error: 'Not initialized' }
  }

  if (username !== config.admin.username) {
    return { success: false, error: 'Invalid credentials' }
  }

  const isValid = await verifyPassword(password, config.admin.passwordHash)
  if (!isValid) {
    return { success: false, error: 'Invalid credentials' }
  }

  const token = await createToken(username, config.jwtSecret)
  return { success: true, token }
}

export async function updateAccount(
  currentUsername: string,
  updates: { username?: string; password?: string }
): Promise<{ success: boolean; error?: string }> {
  const config = await readConfig()

  if (!config.initialized) {
    return { success: false, error: 'Not initialized' }
  }

  if (currentUsername !== config.admin.username) {
    return { success: false, error: 'Unauthorized' }
  }

  if (updates.username && updates.username.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters' }
  }

  if (updates.password && updates.password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' }
  }

  const newConfig: Config = {
    ...config,
    admin: {
      username: updates.username || config.admin.username,
      passwordHash: updates.password
        ? await hashPassword(updates.password)
        : config.admin.passwordHash,
    },
  }

  await writeConfig(newConfig)
  return { success: true }
}

// 验证请求中的 token
export async function verifyAuth(request: Request): Promise<{ username: string } | null> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice(7)
  const config = await readConfig()

  if (!config.initialized) {
    return null
  }

  return verifyToken(token, config.jwtSecret)
}
