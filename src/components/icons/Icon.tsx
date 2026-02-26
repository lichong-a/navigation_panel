'use client'

import { Icon as IconifyIcon } from '@iconify/react'
import type { SiteIcon } from '@/types'
import { cn } from '@/lib/utils'

interface IconProps {
  icon: SiteIcon
  size?: number
  className?: string
}

export function Icon({ icon, size = 24, className }: IconProps) {
  const iconSize = size

  if (icon.type === 'iconify') {
    return (
      <IconifyIcon
        icon={icon.value}
        width={iconSize}
        height={iconSize}
        className={cn('text-current', className)}
      />
    )
  }

  if (icon.type === 'uploaded' || icon.type === 'favicon') {
    return (
      <img
        src={icon.value}
        alt=""
        width={iconSize}
        height={iconSize}
        className={cn('object-contain', className)}
        style={{ width: iconSize, height: iconSize }}
      />
    )
  }

  return (
    <div
      className={cn('bg-[var(--color-surface)] rounded', className)}
      style={{ width: iconSize, height: iconSize }}
    />
  )
}
