'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'

function IconLogo({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('h-6 w-6', className)} {...props}>
      <Image
        src="/einstein.png"
        alt="CereLogic Logo"
        width={128}
        height={128}
        className="w-full h-full object-contain dark:invert"
        quality={100}
        unoptimized
      />
    </div>
  )
}

export { IconLogo }

