import { cn } from '@/lib/utils'
import Image from 'next/image'

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <Image src="/logo.svg" alt="Aether Co-Pilot Logo" fill />
    </div>
  )
}
